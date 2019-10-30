import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import * as actions from './actions'

export const initialState = {
  dirtyCount: 0,
  isLoading: false,
  isResetting: false,
  isSaving: false,
  isInitialized: false,
}

const dirtyCount = createReducer(initialState.dirtyCount)
  .handleAction(actions.setDirty, (state, action) => state + action.payload)
  .handleAction(actions.saveDatabase.success, (_state, _action) => 0)

const isLoading = createReducer(initialState.isLoading)
  .handleAction(actions.loadDatabase.request, (_state, _action) => true)
  .handleAction(
    [
      actions.loadDatabase.success,
      actions.loadDatabase.failure,
      actions.loadDatabase.cancel,
    ],
    (_state, _action) => false,
  )

const isInitialized = createReducer(initialState.isSaving)
  .handleAction(actions.loadDatabase.success, (_state, _action) => true)
  .handleAction(actions.wipeDatabase.success, (_state, _action) => false)

const isResetting = createReducer(initialState.isResetting)
  .handleAction(actions.resetDatabase.request, (_state, _action) => true)
  .handleAction(
    [
      actions.resetDatabase.success,
      actions.resetDatabase.failure,
      actions.resetDatabase.cancel,
    ],
    (_state, _action) => false,
  )

const isSaving = createReducer(initialState.isSaving)
  .handleAction(actions.saveDatabase.request, (_state, _action) => true)
  .handleAction(
    [
      actions.saveDatabase.success,
      actions.saveDatabase.failure,
      actions.saveDatabase.cancel,
    ],
    (_state, _action) => false,
  )

export default combineReducers({
  dirtyCount,
  isInitialized,
  isLoading,
  isResetting,
  isSaving,
})
