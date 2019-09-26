import { Person } from 'blockstack'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { setUser, logout } from './actions'

export const initialState = {
  isAuthenticated: false,
  person: null as Person | null,
  username: null as string | null,
}

const isAuthenticated = createReducer(initialState.isAuthenticated)
  .handleAction(setUser, (_state, _action) => true)
  .handleAction(logout, (_state, _action) => false)

const person = createReducer(initialState.person)
  .handleAction(setUser, (_state, action) => new Person(action.payload.profile))
  .handleAction(logout, (_state, _action) => null)

const username = createReducer(initialState.username)
  .handleAction(setUser, (_state, action) => action.payload.username)
  .handleAction(logout, (_state, _action) => null)

export default combineReducers({
  isAuthenticated,
  person,
  username,
})
