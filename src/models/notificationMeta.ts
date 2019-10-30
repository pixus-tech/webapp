import { IndexableBoolean } from 'utils/db'

export default interface NotificationMeta {
  isRead: IndexableBoolean
}

export const defaultNotificationMeta: NotificationMeta = {
  isRead: 0,
}
