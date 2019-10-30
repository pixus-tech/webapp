import { List } from 'immutable'

import Notification from 'models/notification'
import { RootState } from 'typesafe-actions'

const dataSelector = (state: RootState) => state.notifications.data
const orderSelector = (state: RootState) => state.notifications.order

export const notificationsSelector = (state: RootState): List<Notification> => {
  const data = dataSelector(state)
  const notificationIds = orderSelector(state)

  return (notificationIds
    .map(notificationId => data.get(notificationId))
    .filterNot(i => typeof i === 'undefined') as List<Notification>).filterNot(
    notification => notification.meta.isRead > 0,
  )
}
