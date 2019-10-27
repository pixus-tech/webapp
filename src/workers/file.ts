// eslint-disable-next-line
import FileWorker from 'worker-loader!workers/file.worker'
import { registerWorker, postJob } from './'

const fileWorker = new FileWorker()
registerWorker(fileWorker)

export interface FileReaderResponse {
  arrayBuffer: ArrayBuffer
  objectURL: string
}

export function readFile(file: File) {
  return postJob<FileReaderResponse>(fileWorker, 'readFile', { file })
}
