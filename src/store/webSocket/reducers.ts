import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { subscribeWebSocket, unsubscribeWebSocket } from './actions'

export const initialState = {
  isEnabled: false,
}

const isEnabled = createReducer(initialState.isEnabled)
  .handleAction(subscribeWebSocket, (state, action) => {
    return true
  })
  .handleAction(unsubscribeWebSocket, (state, action) => {
    return false
  })

export default combineReducers({
  isEnabled,
})
