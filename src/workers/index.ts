import { Buffer } from 'buffer'
import workerize from 'workerize'
import uuid from 'uuid/v4'

// eslint-disable-next-line
import fileReaderSource from 'raw-loader!./fileReader'
import * as FileReaderType from './fileReader'

// eslint-disable-next-line
import CryptoWorker from 'worker-loader!workers/crypto.worker'

const cryptoWorker = new CryptoWorker()

function postJob(worker: Worker, job: string, payload: object) {
  const id = uuid()

  return new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let removeEventListeners: () => void

    function handleError(errorEvent: ErrorEvent) {
      // TODO: fix: one failing worker rejects all current workers
      removeEventListeners()
      reject(errorEvent.error)
    }

    function handleResult(event: MessageEvent) {
      if (event.data.id === id) {
        removeEventListeners()
        resolve(event.data.result)
      }
    }

    removeEventListeners = function() {
      worker.removeEventListener('error', handleError)
      worker.removeEventListener('message', handleResult)
    }

    worker.addEventListener('error', handleError)
    worker.addEventListener('message', handleResult)
    worker.postMessage({ id, job, ...payload })
  })
}

export function encrypt(buffer: Buffer | string, publicKey: string) {
  return postJob(cryptoWorker, 'encrypt', { buffer, key: publicKey })
}

export function decrypt(buffer: string, privateKey: string) {
  return postJob(cryptoWorker, 'decrypt', { buffer, key: privateKey })
}

export const fileReader = workerize<typeof FileReaderType>(fileReaderSource)
