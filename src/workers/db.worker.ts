import * as DB from 'worker-scripts/db'

// Imported types
import DexieNamespace, { IndexableType } from 'dexie'
import Album from 'models/album'
import AlbumMeta from 'models/albumMeta'
import BaseModel from 'models'
import Image, { ImageFilterName } from 'models/image'
import ImageMeta from 'models/imageMeta'

declare const db: typeof DB
declare const self: DedicatedWorkerGlobalScope

self.importScripts('/static/js/db.dev.js')

const { Dexie } = db
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

type Query = { [keyPath: string]: IndexableType }

class PixusDatabase extends Dexie {
  public albums: DexieNamespace.Table<Album, string>
  public images: DexieNamespace.Table<Image, string>

  public constructor() {
    super('pixus-database')

    this.version(1).stores({
      albums: '_id,name,isOnRadiks,isDirty',
      images:
        '_id,createdAt,userGroupId,meta.isFavorite,isOnRadiks,isDirty,isImageStored,isPreviewImageStored',
    })

    this.albums = this.table('albums')
    this.images = this.table('images')
  }
}

const database = new PixusDatabase()

async function getAlbums(): Promise<Album[]> {
  return await database.albums.toArray()
}

async function findImages(
  filterName: ImageFilterName,
  filterData?: any,
): Promise<Image[]> {
  switch (filterName) {
    case 'album': {
      if (typeof filterData !== 'string') {
        return Promise.reject('Filter data (userGroupId) should be a string.')
      }
      return await database.images.where({ userGroupId: filterData }).toArray()
    }
    case 'favorites': {
      return await database.images.where({ 'meta.isFavorite': 1 }).toArray()
    }
    case 'recent-uploads': {
      const latestUpload = await database.images.orderBy('createdAt').last()
      if (latestUpload === undefined) {
        return Promise.resolve([])
      }
      return await database.images
        .where('createdAt')
        .above(latestUpload.createdAt - MILLISECONDS_PER_DAY)
        .toArray()
    }
    default: {
      return Promise.resolve([])
    }
  }
}

function upsert<T extends BaseModel>(
  table: DexieNamespace.Table<T, string>,
  model: T,
  defaultMeta: AlbumMeta | ImageMeta,
) {
  return new Promise((resolve, reject) => {
    table
      .update(model._id, model)
      .then(updates => {
        if (updates === 0) {
          // Add the model if it could not be updated
          table
            .add({ meta: defaultMeta, ...model })
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      })
      .catch(reject)
  })
}

const upsertAlbum = upsert.bind(null, database.albums)
const upsertImage = upsert.bind(null, database.images)

function defaultResponse(id: string, promise: Promise<any>) {
  return promise
    .then(function() {
      self.postMessage({ id, result: true })
    })
    .catch(function(error) {
      self.postMessage({ id, error })
    })
}

function resultResponse(id: string, promise: Promise<any>) {
  return promise
    .then(function(result) {
      self.postMessage({ id, result })
    })
    .catch(function(error) {
      self.postMessage({ id, error })
    })
}

self.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (typeof job !== 'string') {
      throw 'job must be a string'
    }

    if (job.endsWith('albums.serialize')) {
      resultResponse(id, database.albums.toArray().then(JSON.stringify))
    } else if (job.endsWith('albums.deserialize')) {
      defaultResponse(
        id,
        database.transaction('rw', database.albums, async () => {
          const albums = JSON.parse(payload)
          await database.albums.clear()
          await database.albums.bulkAdd(albums)
        }),
      )
    } else if (job.endsWith('albums.add')) {
      defaultResponse(id, database.albums.add(payload))
    } else if (job.endsWith('albums.all')) {
      resultResponse(id, getAlbums())
    } else if (job.endsWith('albums.update')) {
      defaultResponse(id, upsertAlbum(payload.album, payload.defaultMeta))
    } else if (job.endsWith('albums.updateAll')) {
      defaultResponse(
        id,
        Promise.all(
          payload.albums.map((album: Album) =>
            upsertAlbum(album, payload.defaultMeta),
          ),
        ),
      )
    } else if (job.endsWith('images.serialize')) {
      resultResponse(id, database.images.toArray().then(JSON.stringify))
    } else if (job.endsWith('images.deserialize')) {
      defaultResponse(
        id,
        database.transaction('rw', database.images, async () => {
          const images = JSON.parse(payload)
          await database.images.clear()
          await database.images.bulkAdd(images)
        }),
      )
    } else if (job.endsWith('images.add')) {
      defaultResponse(id, database.images.add(payload))
    } else if (job.endsWith('images.destroy')) {
      defaultResponse(
        id,
        database.images
          .where('_id')
          .equals(payload._id)
          .delete(),
      )
    } else if (job.endsWith('images.where')) {
      resultResponse(id, findImages(payload.name, payload.data))
    } else if (job.endsWith('images.update')) {
      defaultResponse(id, upsertImage(payload.image, payload.defaultMeta))
    } else if (job.endsWith('images.updateAll')) {
      defaultResponse(
        id,
        Promise.all(
          payload.images.map((image: Image) =>
            upsertImage(image, payload.defaultMeta),
          ),
        ),
      )
    } else {
      throw 'unknown job'
    }
  } catch (error) {
    self.postMessage({ id, error: `${error}` })
  }
})

export default null
