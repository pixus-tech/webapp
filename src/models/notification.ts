import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, { UnsavedModel, parseAttribute } from './'
import NotificationRecord from 'db/notification'

export enum NotificationType {
  Unknown = 0,
  AlbumInvite = 1,
  NewAlbumImages = 2,
  UserJoinedGroup = 4,
}

export default interface Notification extends BaseModel {
  addressee: string
  creator: string
  createdAt?: number
  isRead: boolean
  message?: string
  targetId?: string
  type: NotificationType
}

export type UnsavedNotification = UnsavedModel<Notification>

function parseNotificationType(type: any) {
  if (type === 1) {
    return NotificationType.AlbumInvite
  }

  if (type === 2) {
    return NotificationType.NewAlbumImages
  }

  if (type === 3) {
    return NotificationType.UserJoinedGroup
  }

  return NotificationType.Unknown
}

export function parseNotificationRecord(
  record: NotificationRecord,
): Notification {
  return {
    _id: record._id,
    addressee: record.attrs.addressee,
    creator: parseAttribute(record.attrs.creator),
    createdAt: record.attrs.createdAt,
    isRead: record.attrs.isRead,
    message: parseAttribute(record.attrs.message),
    targetId: record.attrs.targetId,
    type: parseNotificationType(record.attrs.type),
  }
}

export function parseNotificationRecords(
  records: NotificationRecord[],
): Notification[] {
  return _.map(records, parseNotificationRecord)
}

export const validationSchema = {
  invite: Yup.object().shape({
    addressee: Yup.string().required('Is Required'),
    message: Yup.string().required('Is Required'),
  }),
}
