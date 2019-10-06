import { Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'

import { CONNECTIVITY_FILE_PATH } from 'constants/index'
import BaseService from './baseService'
import { Queue } from './dispatcher'
import files from './files'

interface StatusResponse {
  status: string
}

class Connectivity extends BaseService {
  isRadiksReachable = () =>
    this.dispatcher.performAsync<boolean>(
      Queue.RecordOperation,
      (resolve, reject) => {
        ajax.getJSON<StatusResponse>(`${this.config.radiksUrl}ping`).subscribe({
          next(response) {
            resolve(response && response.status === 'alive')
          },
          error(error) {
            reject(error)
          },
        })
      },
    )

  isBlockstackReachable = () =>
    this.dispatcher.performAsync<boolean>(
      Queue.RecordOperation,
      (resolve, reject) => {
        ajax
          .getJSON<StatusResponse>(`${this.config.blockstackCoreUrl}node/ping`)
          .subscribe({
            next(response) {
              resolve(response && response.status === 'alive')
            },
            error(error) {
              reject(error)
            },
          })
      },
    )

  isHubReachable = () =>
    new Observable<boolean>(subscriber => {
      const connectivity = JSON.stringify({ time: new Date().getTime() })
      files.upload(CONNECTIVITY_FILE_PATH, connectivity).subscribe({
        complete() {
          subscriber.next(true)
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
}

export default new Connectivity()
