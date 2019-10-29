import { List, Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Notification from 'models/notification'

import * as actions from './actions'

export const initialState = {
  data: Map<string, Notification>(),
  order: List<string>(),
}

const data = createReducer(initialState.data)
  .handleAction(actions.getNotifications.success, (state, action) =>
    Map(
      action.payload.notifications.map(notification => [
        notification._id,
        notification,
      ]),
    ),
  )
  .handleAction(actions.setNotificationRead.request, (state, action) => {
    const notification = action.payload
    return state.set(notification._id, { ...notification, isRead: true })
  })

const order = createReducer(initialState.order).handleAction(
  actions.getNotifications.success,
  (state, action) =>
    List(action.payload.notifications)
      .sortBy(n => n.createdAt)
      .map(n => n._id),
)

export default combineReducers({
  data,
  order,
})
