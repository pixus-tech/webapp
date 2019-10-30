import { Observable } from 'rxjs'

import NotificationRecord, {
  NotificationRecordFactory,
} from 'db/radiks/notification'
import Notification, {
  parseNotificationRecord,
  parseNotificationRecords,
  UnsavedNotification,
  NotificationFilterAttributes,
} from 'models/notification'
import NotificationMeta, {
  defaultNotificationMeta,
} from 'models/notificationMeta'
import { currentUsername } from 'utils/blockstack'

import BaseService from './baseService'
import db from './db'
import { Queue } from './dispatcher'
import records from './records'

class Notifications extends BaseService {
  refreshNotifications = () =>
    this.dispatcher.performAsync<undefined>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      NotificationRecord.fetchList<NotificationRecord>({
        addressee: currentUsername(),
      })
        .then(notificationRecords => {
          const notifications = parseNotificationRecords(notificationRecords)
          db.notifications
            .updateAll(notifications)
            .then(() => {
              resolve(undefined)
            })
            .catch(reject)
        })
        .catch(reject)
    })

  getNotificationsFromCache = (filter: NotificationFilterAttributes) =>
    this.dispatcher.performAsync<Notification[]>(
      Queue.RecordOperation,
      (resolve, reject) => {
        db.notifications
          .where(filter)
          .then(resolve)
          .catch(reject)
      },
    )

  createNotification = (
    notification: Omit<UnsavedNotification, 'creator' | 'meta'>,
    key: string,
  ) => {
    const notificationRecord = NotificationRecordFactory.build({
      ...notification,
      creator: currentUsername(),
      meta: defaultNotificationMeta,
    })

    notificationRecord.userPublicKey = key

    return new Observable<{ resource: Notification }>(subscriber => {
      records.save(notificationRecord).subscribe({
        next() {
          const notification: Notification = {
            ...parseNotificationRecord(notificationRecord),
            meta: defaultNotificationMeta,
          }
          subscriber.next({
            resource: notification,
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
    return this.updateMeta(notification, { isRead: 1 })
  }

  updateMeta = (notification: Notification, meta: Partial<NotificationMeta>) =>
    this.dispatcher.performAsync<Notification>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const updatedMeta: NotificationMeta = { ...notification.meta, ...meta }
        const updatedNotification: Notification = {
          ...notification,
          meta: updatedMeta,
        }
        db.notifications
          .update(updatedNotification)
          .then(() => {
            resolve(updatedNotification)
          })
          .catch(reject)
      },
    )
}

export default new Notifications()
