import { API } from 'typings/types'
import { createAsyncAction } from 'typesafe-actions'

import Notification from 'models/notification'

export const getNotifications = createAsyncAction(
  'NOTIFICATIONS__LIST__REQUEST',
  'NOTIFICATIONS__LIST__SUCCESS',
  'NOTIFICATIONS__LIST__FAILURE',
  'NOTIFICATIONS__LIST__CANCEL',
)<
  undefined,
  API.ShowResponse<{
    notifications: Notification[]
  }>,
  API.ErrorResponse<undefined>,
  undefined
>()

export const setNotificationRead = createAsyncAction(
  'NOTIFICATIONS__SET_READ__REQUEST',
  'NOTIFICATIONS__SET_READ__SUCCESS',
  'NOTIFICATIONS__SET_READ__FAILURE',
  'NOTIFICATIONS__SET_READ__CANCEL',
)<
  Notification,
  API.PutResponse<Notification>,
  API.ErrorResponse<Notification>,
  Notification
>()
