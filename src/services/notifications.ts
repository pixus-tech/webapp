import { Observable } from 'rxjs'

import NotificationRecord, {
  NotificationRecordFactory,
} from 'db/radiks/notification'
import Notification, {
  parseNotificationRecord,
  parseNotificationRecords,
  UnsavedNotification,
} from 'models/notification'
import { currentUsername } from 'utils/blockstack'

import BaseService from './baseService'
import { Queue } from './dispatcher'
import records from './records'

class Notifications extends BaseService {
  getNotifications = () =>
    this.dispatcher.performAsync<Notification[]>(
      Queue.RecordOperation,
      function(resolve, reject) {
        NotificationRecord.fetchList<NotificationRecord>({
          addressee: currentUsername(),
          isRead: false,
        })
          .then(notificationRecords => {
            resolve(parseNotificationRecords(notificationRecords))
          })
          .catch(reject)
      },
    )

  createNotification = (
    notification: Omit<UnsavedNotification, 'creator' | 'isRead'>,
    key: string,
  ) => {
    const notificationRecord = NotificationRecordFactory.build({
      ...notification,
      creator: currentUsername(),
      isRead: false,
    })

    notificationRecord.userPublicKey = key

    return new Observable<{ resource: Notification }>(subscriber => {
      records.save(notificationRecord).subscribe({
        next() {
          subscriber.next({
            resource: parseNotificationRecord(notificationRecord),
          })
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
  }

  setNotificationRead = (notification: Notification) => {
    const notificationRecord = NotificationRecordFactory.build(notification)
    notificationRecord.update({
      isRead: true,
      signingKeyId: 'personal',
      publicKey: '',
    })

    return new Observable<{ resource: Notification }>(subscriber => {
      records.save(notificationRecord).subscribe({
        next() {
          subscriber.next({
            resource: parseNotificationRecord(notificationRecord),
          })
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
  }
}

export default new Notifications()
