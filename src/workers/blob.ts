// eslint-disable-next-line
import BlobWorker from 'worker-loader!workers/blob.worker'
import { registerWorker, postJob } from './'

const blobWorker = new BlobWorker()
registerWorker(blobWorker)

export function storeData(id: string, data: ArrayBuffer, type: string) {
  return postJob<string>(blobWorker, 'put', { payload: { id, data, type } })
}

export function getObjectURL(id: string) {
  return postJob<string>(blobWorker, 'fetch', { payload: id })
}

export function destroy(id: string) {
  return postJob<boolean>(blobWorker, 'destroy', { payload: id })
}
