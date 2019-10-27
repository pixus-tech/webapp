// Imported types
import { FileReaderResponse } from './file'

declare const self: DedicatedWorkerGlobalScope

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

  return {
    arrayBuffer,
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
