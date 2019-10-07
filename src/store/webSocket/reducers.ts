import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { subscribeWebSocket, unsubscribeWebSocket } from './actions'

export const initialState = {
  isEnabled: false,
}

const isEnabled = createReducer(initialState.isEnabled)
  .handleAction(subscribeWebSocket, (_state, _action) => {
    return true
  })
  .handleAction(unsubscribeWebSocket, (_state, _action) => {
    return false
  })

export default combineReducers({
  isEnabled,
})
