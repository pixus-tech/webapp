import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'

import Notification from 'models/notification'
import { FilteredNotifications, NotificationFilter } from './types'

export const getNotifications = createStandardAction('NOTIFICATIONS__GET_LIST')<
  NotificationFilter
>()

export const refreshNotificationsCache = createAsyncAction(
  'NOTIFICATIONS__REFRESH_CACHE__REQUEST',
  'NOTIFICATIONS__REFRESH_CACHE__SUCCESS',
  'NOTIFICATIONS__REFRESH_CACHE__FAILURE',
  'NOTIFICATIONS__REFRESH_CACHE__CANCEL',
)<
  NotificationFilter,
  NotificationFilter,
  API.ErrorResponse<NotificationFilter>,
  NotificationFilter
>()

export const getNotificationsFromCache = createAsyncAction(
  'NOTIFICATIONS__FROM_CACHE__REQUEST',
  'NOTIFICATIONS__FROM_CACHE__SUCCESS',
  'NOTIFICATIONS__FROM_CACHE__FAILURE',
  'NOTIFICATIONS__FROM_CACHE__CANCEL',
)<
  NotificationFilter,
  FilteredNotifications,
  API.ErrorResponse<NotificationFilter>,
  NotificationFilter
>()

export const setNotificationRead = createAsyncAction(
  'NOTIFICATIONS__SET_READ__REQUEST',
  'NOTIFICATIONS__SET_READ__SUCCESS',
  'NOTIFICATIONS__SET_READ__FAILURE',
  'NOTIFICATIONS__SET_READ__CANCEL',
)<Notification, Notification, API.ErrorResponse<Notification>, Notification>()
