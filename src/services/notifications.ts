import { Observable } from 'rxjs'

import NotificationRecord, { NotificationRecordFactory } from 'db/notification'
import Notification, {
  parseNotificationRecord,
  parseNotificationRecords,
} from 'models/notification'
import { currentUserName } from 'utils/blockstack'

export const getNotifications = () => {
  return new Observable<Notification[]>(subscriber => {
    NotificationRecord.fetchList<NotificationRecord>({
      addressee: currentUserName(),
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
  notification: Omit<Notification, 'creator' | 'isRead'>,
) => {
  const notificationRecord = NotificationRecordFactory.build({
    ...notification,
    creator: currentUserName(),
    isRead: false,
  })

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
