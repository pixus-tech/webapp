import * as _ from 'lodash'
import * as Yup from 'yup'

import BaseModel, { UnsavedModel, parseAttribute } from './'
import NotificationMeta from './notificationMeta'
import NotificationRecord from 'db/radiks/notification'

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
  message?: string
  targetId?: string
  type: NotificationType

  // Fields that are stored separately from radiks
  meta: NotificationMeta
}

export type UnsavedNotification = UnsavedModel<Notification>
export interface RemoteNotification extends Omit<Notification, 'meta'> {
  meta: Partial<NotificationMeta>
}

export type NotificationFilterName = 'unread'
export interface NotificationFilterAttributes {
  name: NotificationFilterName
  data?: any
}

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
): RemoteNotification {
  return {
    _id: record._id,
    addressee: record.attrs.addressee,
    creator: parseAttribute(record.attrs.creator),
    createdAt: record.attrs.createdAt,
    message: parseAttribute(record.attrs.message),
    meta: {},
    targetId: record.attrs.targetId,
    type: parseNotificationType(record.attrs.type),
  }
}

export function parseNotificationRecords(
  records: NotificationRecord[],
): RemoteNotification[] {
  return _.map(records, parseNotificationRecord)
}

export const validationSchema = {
  invite: Yup.object().shape({
    addressee: Yup.string().required('Is Required'),
    message: Yup.string().required('Is Required'),
  }),
}
