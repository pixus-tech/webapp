import _ from 'lodash'
import uuid from 'uuid/v4'

import * as cryptoWorker from './crypto'
import * as dbWorker from './db'
import { readFileWorker } from './readFile'

interface JobActions {
  resolve: (payload: any) => void
  reject: (error: Error) => void
}

const jobs: { [id: string]: JobActions } = {}

export function registerWorker(worker: Worker) {
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

export function postJob<T>(worker: Worker, job: string, payload: object = {}) {
  return new Promise<T>((resolve, reject) => {
    const id = uuid()
    jobs[id] = { resolve, reject }
    worker.postMessage({ id, job, ...payload })
  })
}

export { cryptoWorker, dbWorker, readFileWorker }
