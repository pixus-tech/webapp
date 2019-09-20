import { Observable } from 'rxjs'

import BaseRecord from 'db/index'

export function saveRecord<T extends BaseRecord>(record: T) {
  return new Observable<T>(subscriber => {
    record
      .save()
      .then(() => {
        subscriber.next(record)
        subscriber.complete()
      })
      .catch((error: string) => {
        subscriber.error(error)
      })
  })
}
