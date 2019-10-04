import { List, Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import User from 'models/user'

import * as actions from './actions'

export const initialState = {
  currentUsername: null as null | string,
  isFetching: Map<string, boolean>(),
  suggestions: List<User>(),
  users: Map<string, User | null>(),
}

const currentUsername = createReducer(initialState.currentUsername)
  .handleAction(actions.findUser.request, (_state, action) => action.payload)
  .handleAction(
    actions.findUser.success,
    (_state, action) => action.payload.username,
  )

const isFetching = createReducer(initialState.isFetching)
  .handleAction(actions.findUser.request, (state, action) =>
    state.set(action.payload, true),
  )
  .handleAction(actions.findUser.success, (state, action) =>
    state.set(action.payload.username, false),
  )
  .handleAction(actions.findUser.failure, (state, action) =>
    state.set(action.payload.resource, false),
  )
  .handleAction(actions.findUser.cancel, (state, action) =>
    state.set(action.payload, false),
  )

const suggestions = createReducer(initialState.suggestions).handleAction(
  actions.searchUsers.success,
  (_state, action) => List(action.payload),
)

const users = createReducer(initialState.users)
  .handleAction(
    [actions.findUser.request, actions.findUser.cancel],
    (state, action) => state.delete(action.payload),
  )
  .handleAction(actions.findUser.success, (state, action) =>
    state.set(action.payload.username, action.payload),
  )
  .handleAction(actions.findUser.failure, (state, action) =>
    state.set(action.payload.resource, null),
  )

export default combineReducers({
  currentUsername,
  isFetching,
  suggestions,
  users,
})
