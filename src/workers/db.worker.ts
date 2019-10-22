import Dexie, { IndexableType } from 'dexie'
import BaseModel from 'models'
import Album from 'models/album'
import Image from 'models/image'

// eslint-disable-next-line no-restricted-globals
const ctx = (self as any) as DedicatedWorkerGlobalScope // eslint-disable-line no-restricted-globals
ctx.importScripts('/static/js/dexie.js')

type QueryableAttributes = { [key: string]: IndexableType }

class PixusDatabase extends Dexie {
  public albums: Dexie.Table<Album, string>
  public images: Dexie.Table<Image, string>

  public constructor() {
    super('pixus-database')

    this.version(1).stores({
      albums: '_id,name',
      images: '_id,userGroupId',
    })

    this.albums = this.table('albums')
    this.images = this.table('images')
  }
}

const db = new PixusDatabase()

async function getAlbums(): Promise<Album[]> {
  return await db.albums.toArray()
}

async function findImages(filter: QueryableAttributes): Promise<Image[]> {
  return await db.images.where(filter).toArray()
}

function upsert<T extends BaseModel>(table: Dexie.Table<T, string>, model: T) {
  return table.update(model._id, model)
}

const upsertAlbum = upsert.bind(null, db.albums)
const upsertImage = upsert.bind(null, db.images)

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

    if (job.endsWith('albums.serialize')) {
      resultResponse(id, db.albums.toArray().then(JSON.stringify))
    } else if (job.endsWith('albums.deserialize')) {
      defaultResponse(
        id,
        db.transaction('rw', db.albums, async () => {
          const albums = JSON.parse(payload)
          await db.albums.clear()
          await db.albums.bulkAdd(albums)
        }),
      )
    } else if (job.endsWith('albums.add')) {
      defaultResponse(id, db.albums.add(payload))
    } else if (job.endsWith('albums.all')) {
      resultResponse(id, getAlbums())
    } else if (job.endsWith('albums.update')) {
      defaultResponse(id, upsertAlbum(payload))
    } else if (job.endsWith('albums.updateAll')) {
      defaultResponse(id, Promise.all(payload.map(upsertAlbum)))
    } else if (job.endsWith('images.serialize')) {
      resultResponse(id, db.images.toArray().then(JSON.stringify))
    } else if (job.endsWith('images.deserialize')) {
      defaultResponse(
        id,
        db.transaction('rw', db.images, async () => {
          const images = JSON.parse(payload)
          await db.images.clear()
          await db.images.bulkAdd(images)
        }),
      )
    } else if (job.endsWith('images.add')) {
      defaultResponse(id, db.images.add(payload))
    } else if (job.endsWith('images.destroy')) {
      defaultResponse(
        id,
        db.images
          .where('_id')
          .equals(payload._id)
          .delete(),
      )
    } else if (job.endsWith('images.where')) {
      resultResponse(id, findImages(payload))
    } else if (job.endsWith('images.update')) {
      defaultResponse(id, upsertImage(payload))
    } else if (job.endsWith('images.updateAll')) {
      defaultResponse(id, Promise.all(payload.map(upsertImage)))
    } else {
      throw 'unknown job'
    }
  } catch (error) {
    ctx.postMessage({ id, error })
  }
})

export default null
