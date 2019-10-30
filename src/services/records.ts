import BaseRecord from 'db/radiks/index'
import BaseService from './baseService'
import { Queue } from './dispatcher'

class Records extends BaseService {
  delete = <T extends BaseRecord>(record: T) =>
    this.dispatcher.performAsync<T>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      record
        .save()
        .then(() => {
          record
            .destroy()
            .then(isDestroyed => {
              if (isDestroyed) {
                resolve(record)
              } else {
                reject(Error('Could not be destroyed.'))
              }
            })
            .catch(reject)
        })
        .catch(reject)
    })

  save = <T extends BaseRecord>(record: T) =>
    this.dispatcher.performAsync<T>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      record
        .save()
        .then(() => {
          resolve(record)
        })
        .catch(reject)
    })
}

export default new Records()
