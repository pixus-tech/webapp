import * as DB from 'worker-scripts/db'

// Imported types
import DexieNamespace from 'dexie'

declare const db: typeof DB
declare const self: DedicatedWorkerGlobalScope

self.importScripts('/static/js/db.dev.js')

const { Dexie } = db

interface Data {
  _id: string
  createdAt: number
  data: ArrayBuffer
  type: string
}

class BlobDatabase extends Dexie {
  public blobs: DexieNamespace.Table<Data, string>

  public constructor() {
    super('pixus-blobs')

    this.version(1).stores({
      blobs: '_id,createdAt',
    })

    this.blobs = this.table('blobs')
  }
}

const database = new BlobDatabase()

function defaultResponse(id: string, promise: Promise<any>) {
  return promise
    .then(function() {
      self.postMessage({ id, result: true })
    })
    .catch(function(error) {
      self.postMessage({ id, error })
    })
}

const allocatedObjectURLs: { [id: string]: string } = {}

function objectURLFromData(data: Data) {
  let objectURL = allocatedObjectURLs[data._id]
  if (objectURL !== undefined) {
    return objectURL
  }

  const blob = new Blob([data.data], { type: data.type })
  objectURL = URL.createObjectURL(blob)
  allocatedObjectURLs[data._id] = objectURL
  return objectURL
}

self.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (typeof job !== 'string') {
      throw Error('job must be a string')
    }

    if (job === 'put') {
      const newData: Data = {
        _id: payload.id,
        createdAt: new Date().getTime(),
        data: payload.data,
        type: payload.type,
      }
      database.blobs
        .put(newData)
        .then(() => {
          self.postMessage({ id, result: objectURLFromData(newData) })
        })
        .catch(error => {
          self.postMessage({ id, error: `${error}` })
        })
    } else if (job === 'fetch') {
      database.blobs
        .where({ _id: payload })
        .first()
        .then(data => {
          if (data !== undefined) {
            self.postMessage({ id, result: objectURLFromData(data) })
          } else {
            throw Error(`Blob not found for id ${payload}`)
          }
        })
        .catch(error => {
          self.postMessage({ id, error: `${error}` })
        })
    } else if (job === 'destroy') {
      const allocatedObjectURL = allocatedObjectURLs[payload]
      if (allocatedObjectURL !== undefined) {
        URL.revokeObjectURL(allocatedObjectURL)
        delete allocatedObjectURLs[payload]
      }

      defaultResponse(
        id,
        database.blobs
          .where('_id')
          .equals(payload)
          .delete(),
      )
    } else {
      throw Error('unknown job')
    }
  } catch (error) {
    self.postMessage({ id, error: `${error}` })
  }
})

export default null
