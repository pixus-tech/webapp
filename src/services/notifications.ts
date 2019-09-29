import { Observable } from 'rxjs'

import NotificationRecord, { NotificationRecordFactory } from 'db/notification'
import Notification, {
  parseNotificationRecord,
  parseNotificationRecords,
  UnsavedNotification,
} from 'models/notification'
import { currentUsername } from 'utils/blockstack'

export const getNotifications = () => {
  return new Observable<Notification[]>(subscriber => {
    NotificationRecord.fetchList<NotificationRecord>({
      addressee: currentUsername(),
      isRead: false,
    })
      .then(notificationRecords => {
        subscriber.next(parseNotificationRecords(notificationRecords))
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}

export const createNotification = (
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
    notificationRecord
      .save<NotificationRecord>()
      .then(notificationRecord => {
        subscriber.next({
          resource: parseNotificationRecord(notificationRecord),
        })
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}

export const setNotificationRead = (notification: Notification) => {
  const notificationRecord = NotificationRecordFactory.build(notification)
  notificationRecord.update({ isRead: true })

  return new Observable<{ resource: Notification }>(subscriber => {
    notificationRecord
      .save<NotificationRecord>()
      .then(notificationRecord => {
        subscriber.next({
          resource: parseNotificationRecord(notificationRecord),
        })
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}
