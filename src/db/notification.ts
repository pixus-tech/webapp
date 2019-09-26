import _ from 'lodash'
import uuid from 'uuid/v4'

import BaseRecord from './index'
import Notification, { UnsavedNotification } from 'models/notification'
import { currentUserName } from 'utils/blockstack'

export default class NotificationRecord extends BaseRecord {
  static className = 'Notification'
  static schema = {
    addressee: {
      type: String,
      decrypted: true,
    },
    creator: String,
    isRead: {
      type: Boolean,
      decrypted: true,
    },
    message: String,
    targetId: String,
    type: Number,
  }
}

export class NotificationRecordFactory {
  static build(notification: UnsavedNotification | Notification): NotificationRecord {
    return new NotificationRecord({
      _id: _.get(notification, '_id', uuid()),
      addressee: notification.addressee,
      creator: notification.creator,
      isRead: notification.isRead,
      message: notification.message,
      targetId: notification.targetId,
      type: notification.type,
    })
  }
}
