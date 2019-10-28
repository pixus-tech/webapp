import * as FileScripts from 'worker-scripts/files'

// Imported types
import { FileReaderResponse } from './file'
import { EXIFTags } from 'utils/exif'

declare const files: typeof FileScripts
declare const self: DedicatedWorkerGlobalScope

self.importScripts('/static/js/files.dev.js')

const { EXIF } = files

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore workaround a bug in EXIF or rollup, resulting in an undefined `n`
self.n = 0

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reader.abort()
      reject('could not parse file')
    }

    reader.onload = () => {
      if (reader.result === null || typeof reader.result === 'string') {
        reject('File was parsed as null or string.')
      }

      resolve(reader.result as ArrayBuffer)
    }

    reader.readAsArrayBuffer(file)
  })
}

async function readFile(file: File): Promise<FileReaderResponse> {
  const arrayBuffer = await readFileAsArrayBuffer(file)
  const blob = new Blob([arrayBuffer], { type: file.type })
  const objectURL = URL.createObjectURL(blob)
  let exifTags = undefined as undefined | EXIFTags
  try {
    exifTags = EXIF.readFromBinaryFile(arrayBuffer)
  } catch (error) {
    console.error('Could not parse EXIF data of file.', error, files)
  }

  return {
    arrayBuffer,
    exifTags,
    objectURL,
  }
}

self.addEventListener('message', event => {
  const { id, job, file } = event.data

  try {
    if (job === 'readFile') {
      readFile(file)
        .then(result => {
          self.postMessage({ id, result })
        })
        .catch(error => {
          self.postMessage({ id, error: `${error}` })
        })
    } else {
      throw 'unknown job'
    }
  } catch (error) {
    self.postMessage({ id, error: `${error}` })
  }
})

export default null
