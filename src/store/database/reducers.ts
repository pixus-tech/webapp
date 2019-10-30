import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import * as actions from './actions'

export const initialState = {
  dirtyCount: 0,
  isLoading: false,
  isSaving: false,
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
  isLoading,
  isSaving,
})
