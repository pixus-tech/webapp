import Dexie from 'dexie'
import Album from 'models/album'
import AlbumMeta from 'models/albumMeta'

// eslint-disable-next-line no-restricted-globals
const ctx = (self as any) as DedicatedWorkerGlobalScope // eslint-disable-line no-restricted-globals
ctx.importScripts('/static/js/dexie.js')

interface DexieAlbum extends Omit<Album, '_id' | 'meta'> {
  id: string
  meta?: AlbumMeta
}

const defaultAlbumMeta: AlbumMeta = {
  index: Number.MAX_SAFE_INTEGER,
  parentId: undefined,
}

class PixusDatabase extends Dexie {
  public albums: Dexie.Table<DexieAlbum, string>
  public albumMetas: Dexie.Table<AlbumMeta, string>

  public constructor() {
    super('pixus-database')

    this.version(1).stores({
      albums: 'id,name',
      albumMetas: 'albumId',
    })

    this.albums = this.table('albums')
    this.albumMetas = this.table('albumMetas')
  }
}

const db = new PixusDatabase()

function sanitizeAlbum({ _id, meta: _meta, ...album }: Album): DexieAlbum {
  return {
    id: _id,
    ...album,
  }
}

async function getAlbums(): Promise<Album[]> {
  const albums = await db.albums.toArray()

  return await Promise.all(
    albums.map(async ({ id, ...dexieAlbum }) => {
      const storedMeta = await db.albumMetas
        .where('albumId')
        .equals(id)
        .first()
      const album: Album = {
        ...dexieAlbum,
        _id: id,
        meta: storedMeta || defaultAlbumMeta,
      }
      return album
    }),
  )
}

function defaultResponse(id: string, promise: Promise<any>) {
  return promise
    .then(function() {
      ctx.postMessage({ id, result: true })
    })
    .catch(function(error) {
      ctx.postMessage({ id, error })
    })
}

function resultResponse(id: string, promise: Promise<any>) {
  return promise
    .then(function(result) {
      ctx.postMessage({ id, result })
    })
    .catch(function(error) {
      ctx.postMessage({ id, error })
    })
}

ctx.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (typeof job !== 'string') {
      throw 'job must be a string'
    }

    if (job.startsWith('albums.')) {
      if (job.endsWith('.serialize')) {
        resultResponse(id, db.albums.toArray().then(JSON.stringify))
      } else if (job.endsWith('.deserialize')) {
        defaultResponse(
          id,
          db.transaction('rw', db.albums, async () => {
            const albums = JSON.parse(payload)
            await db.albums.clear()
            await db.albums.bulkAdd(albums)
          }),
        )
      } else if (job.endsWith('.add')) {
        defaultResponse(id, db.albums.add(sanitizeAlbum(payload)))
      } else if (job.endsWith('.all')) {
        resultResponse(id, getAlbums())
      } else if (job.endsWith('.update')) {
        defaultResponse(id, db.albums.put(sanitizeAlbum(payload)))
      } else if (job.endsWith('.updateAll')) {
        defaultResponse(id, db.albums.bulkPut(payload.map(sanitizeAlbum)))
      }
    } else if (job.startsWith('albumMetas.')) {
      if (job.endsWith('.serialize')) {
        resultResponse(id, db.albumMetas.toArray().then(JSON.stringify))
      } else if (job.endsWith('.deserialize')) {
        defaultResponse(
          id,
          db.transaction('rw', db.albumMetas, async () => {
            const albumMetas = JSON.parse(payload)
            await db.albumMetas.clear()
            await db.albumMetas.bulkAdd(albumMetas)
          }),
        )
      } else if (job.endsWith('.add')) {
        const { albumId, albumMeta } = payload
        defaultResponse(id, db.albumMetas.add({ ...albumMeta, albumId }))
      } else if (job.endsWith('.update')) {
        const { albumId, albumMeta } = payload
        defaultResponse(id, db.albumMetas.put({ ...albumMeta, albumId }))
      }
    }
  } catch (error) {
    ctx.postMessage({ id, error })
  }
})

export default null
