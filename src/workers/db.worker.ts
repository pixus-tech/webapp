import Dexie from 'dexie'
// eslint-disable-next-line no-restricted-globals
const ctx = (self as any) as DedicatedWorkerGlobalScope // eslint-disable-line no-restricted-globals
ctx.importScripts('/static/js/dexie.js')

interface Album {
  id?: string
  name?: string
}

class PixusDatabase extends Dexie {
  public albums: Dexie.Table<Album, string>

  public constructor() {
    super('pixus-database')

    this.version(1).stores({
      albums: 'id,name',
    })

    this.albums = this.table('albums')
  }
}

const db = new PixusDatabase()

ctx.addEventListener('message', event => {
  const { id, job, payload } = event.data

  try {
    if (job === 'add') {
      db.albums
        .add(payload)
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
