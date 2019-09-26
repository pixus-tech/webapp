import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import NotificationRecord, { NotificationRecordFactory } from 'db/notification'
import Notification, {
  parseNotificationRecord,
  parseNotificationRecords,
  UnsavedNotification,
} from 'models/notification'
import { createUserGroup, currentUser, currentUserName } from 'utils/blockstack'

export const getNotifications = () => {
  return new Observable<Notification[]>(subscriber => {
    NotificationRecord.fetchList<NotificationRecord>({ addressee: currentUserName(), isRead: false })
      .then(notificationRecords => {
        subscriber.next(parseNotificationRecords(notificationRecords))
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}

export const createNotification = (notification: Omit<Notification, 'creator' | 'isRead'>) => {
  const notificationRecord = NotificationRecordFactory.build({
    ...notification,
    creator: currentUserName(),
    isRead: false,
  })

  return new Observable<{ resource: Notification }>(subscriber => {
    notificationRecord.save()
      .then((notificationRecord: NotificationRecord) => {
        subscriber.next({ resource: parseNotificationRecord(notificationRecord) })
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}

export const setNotificationRead = (notification: Notification) => {
  const notificationRecord = NotificationRecordFactory.build(notification)
  notificationRecord.update({ isRead: true })

  return new Observable<{ resource: Notification }>(subscriber => {
    notificationRecord.save()
      .then((notificationRecord: NotificationRecord) => {
        subscriber.next({ resource: parseNotificationRecord(notificationRecord) })
        subscriber.complete()
      })
      .catch(error => subscriber.error(error))
  })
}
