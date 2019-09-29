import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { setUser, logout } from './actions'
import User, { parseProfile } from 'models/user'

export const initialState = {
  isAuthenticated: false,
  user: null as User | null,
  username: null as string | null,
}

const isAuthenticated = createReducer(initialState.isAuthenticated)
  .handleAction(setUser, (_state, _action) => true)
  .handleAction(logout, (_state, _action) => false)

const user = createReducer(initialState.user)
  .handleAction(setUser, (_state, action) =>
    parseProfile(action.payload.username, action.payload.profile),
  )
  .handleAction(logout, (_state, _action) => null)

const username = createReducer(initialState.username)
  .handleAction(setUser, (_state, action) => action.payload.username)
  .handleAction(logout, (_state, _action) => null)

export default combineReducers({
  isAuthenticated,
  user,
  username,
})
