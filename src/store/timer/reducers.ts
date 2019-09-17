import { List } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { startTimer, stopTimer } from './actions'

export const initialState = {
  isRunning: false,
}

const isRunning = createReducer(initialState.isRunning)
  .handleAction(startTimer, (_state, _action) => {
    return true
  })
  .handleAction(stopTimer, (_state, _action) => {
    return false
  })

export default combineReducers({
  isRunning,
})
