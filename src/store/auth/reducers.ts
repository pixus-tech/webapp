import { Person } from 'blockstack'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { setUser, logout } from './actions'

export const initialState = {
  isAuthenticated: false,
  user: null as Person | null,
}

const isAuthenticated = createReducer(initialState.isAuthenticated)
  .handleAction(setUser, (_state, _action) => true)
  .handleAction(logout, (_state, _action) => false)

const user = createReducer(initialState.user)
  .handleAction(setUser, (_state, action) => action.payload)
  .handleAction(logout, (_state, _action) => null)

export default combineReducers({
  isAuthenticated,
  user,
})
