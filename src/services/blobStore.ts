import { blobWorker } from 'workers'

class BlobStore {
  storeData(id: string, data: ArrayBuffer, type: string) {
    return blobWorker.storeData(id, data, type)
  }

  getObjectURL(id: string) {
    return blobWorker.getObjectURL(id)
  }

  async getObjectData(id: string) {
    const objectURL = await this.getObjectURL(id)
    const blob = await fetch(objectURL).then(r => r.blob())
    const arrayBuffer = await new Response(blob).arrayBuffer()
    return arrayBuffer
  }

  destroy(id: string) {
    return blobWorker.destroy(id)
  }
}

export default new BlobStore()
