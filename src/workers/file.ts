// eslint-disable-next-line
import FileWorker from 'worker-loader!workers/file.worker'
import { registerWorker, postJob } from './'
import { EXIFTags } from 'utils/exif'

const fileWorker = new FileWorker()
registerWorker(fileWorker)

export interface FileReaderResponse {
  arrayBuffer: ArrayBuffer
  exifTags?: EXIFTags
  objectURL: string
}

export function readFile(file: File) {
  return postJob<FileReaderResponse>(fileWorker, 'readFile', { file })
}
