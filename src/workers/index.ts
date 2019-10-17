import _ from 'lodash'
import { Buffer } from 'buffer'
import workerize from 'workerize'
import uuid from 'uuid/v4'

// eslint-disable-next-line
import fileReaderSource from 'raw-loader!./fileReader'
import * as FileReaderType from './fileReader'

// eslint-disable-next-line
import CryptoWorker from 'worker-loader!workers/crypto.worker'

interface JobActions {
  resolve: (payload: any) => void
  reject: (error: Error) => void
}

const jobs: { [id: string]: JobActions } = {}

function register(worker: Worker) {
  function handleError(errorEvent: ErrorEvent) {
    // TODO: fix: one failing worker rejects all current workers
    _.each(jobs, ({ reject }, id) => {
      if (reject) {
        reject(Error(errorEvent.message))
      }
      delete jobs[id]
    })
  }

  function handleResult(event: MessageEvent) {
    const { result, error, id: jobId } = event.data
    const actions = jobs[jobId]
    if (actions) {
      if (result && actions.resolve) {
        actions.resolve(result)
      } else if (actions.reject) {
        actions.reject(error)
      }
    }
    delete jobs[jobId]
  }

  worker.addEventListener('error', handleError)
  worker.addEventListener('message', handleResult)
}

function postJob(worker: Worker, job: string, payload: object) {
  return new Promise<string>((resolve, reject) => {
    const id = uuid()
    jobs[id] = { resolve, reject }
    worker.postMessage({ id, job, ...payload })
  })
}

const cryptoWorker = new CryptoWorker()
register(cryptoWorker)

export function encrypt(buffer: Buffer | string, publicKey: string) {
  return postJob(cryptoWorker, 'encrypt', { buffer, key: publicKey })
}

export function decrypt(buffer: string, privateKey: string) {
  return postJob(cryptoWorker, 'decrypt', { buffer, key: privateKey })
}

export const fileReader = workerize<typeof FileReaderType>(fileReaderSource)
