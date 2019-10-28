import { blobWorker } from 'workers'

class BlobStore {
  storeData(id: string, data: ArrayBuffer, type: string) {
    return blobWorker.storeData(id, data, type)
  }

  getObjectURL(id: string) {
    return blobWorker.getObjectURL(id)
  }

  destroy(id: string) {
    return blobWorker.destroy(id)
  }
}

export default new BlobStore()
