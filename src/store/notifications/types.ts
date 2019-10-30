import { API } from 'typings/types'
import Notification, { NotificationFilterAttributes } from 'models/notification'

export type NotificationFilter = API.ResourceFilter<
  NotificationFilterAttributes
>

export interface FilteredNotifications {
  notifications: Notification[]
  filter: NotificationFilter
}
