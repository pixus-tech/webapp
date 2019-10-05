import { Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import User from 'models/user'

import * as actions from './actions'

export const initialState = {
  currentUsername: null as null | string,
  isSearching: false,
  suggestedUsers: Map<string, User>(),
  users: Map<string, User>(),
}

const currentUsername = createReducer(
  initialState.currentUsername,
).handleAction(actions.searchUsers.request, (_state, action) => action.payload)

const isSearching = createReducer(initialState.isSearching)
  .handleAction(actions.searchUsers.request, (state, action) => true)
  .handleAction(
    [
      actions.searchUsers.cancel,
      actions.searchUsers.failure,
      actions.searchUsers.success,
    ],
    (state, action) => false,
  )

const suggestedUsers = createReducer(initialState.suggestedUsers).handleAction(
  actions.searchUsers.success,
  (_state, action) =>
    Map<string, User>(action.payload.map(user => [user.username, user])),
)

const users = createReducer(initialState.users).handleAction(
  actions.selectUsers.success,
  (state, action) =>
    Map<string, User>(action.payload.map(user => [user.username, user])),
)

export default combineReducers({
  currentUsername,
  isSearching,
  suggestedUsers,
  users,
})
