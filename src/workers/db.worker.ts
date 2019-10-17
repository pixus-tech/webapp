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

ctx.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (job === 'albums.add') {
      db.albums
        .add(sanitizeAlbum(payload))
        .then(function() {
          ctx.postMessage({ id, result: true })
        })
        .catch(function(error) {
          ctx.postMessage({ id, error })
        })
    } else if (job === 'albums.all') {
      getAlbums()
        .then(function(result) {
          ctx.postMessage({ id, result })
        })
        .catch(function(error) {
          ctx.postMessage({ id, error })
        })
    } else if (job === 'albums.update') {
      db.albums
        .put(sanitizeAlbum(payload))
        .then(function() {
          ctx.postMessage({ id, result: true })
        })
        .catch(function(error) {
          ctx.postMessage({ id, error })
        })
    } else if (job === 'albums.updateAll') {
      db.albums
        .bulkPut(payload.map(sanitizeAlbum))
        .then(function() {
          ctx.postMessage({ id, result: true })
        })
        .catch(function(error) {
          ctx.postMessage({ id, error })
        })
    } else if (job === 'albumMetas.add') {
      const { albumId, albumMeta } = payload
      db.albumMetas
        .add({ ...albumMeta, albumId })
        .then(function() {
          ctx.postMessage({ id, result: true })
        })
        .catch(function(error) {
          ctx.postMessage({ id, error })
        })
    } else if (job === 'albumMetas.update') {
      const { albumId, albumMeta } = payload
      db.albumMetas
        .put({ ...albumMeta, albumId })
        .then(function() {
          ctx.postMessage({ id, result: true })
        })
        .catch(function(error) {
          ctx.postMessage({ id, error })
        })
    }
  } catch (error) {
    ctx.postMessage({ id, error })
  }
})

export default null
