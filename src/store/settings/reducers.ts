import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { defaultSettings } from 'models/settings'

import * as actions from './actions'

export const initialState = {
  data: defaultSettings,
  isLoading: false,
  isLoaded: false,
  loadingDidFail: false,
}

const data = createReducer(initialState.data)
  .handleAction(
    actions.saveSettings.request,
    (_state, action) => action.payload,
  )
  .handleAction(
    actions.loadSettings.success,
    (_state, action) => action.payload,
  )

const isLoading = createReducer(initialState.isLoading)
  .handleAction(
    [actions.saveSettings.request, actions.loadSettings.request],
    (_state, _action) => true,
  )
  .handleAction(
    [
      actions.saveSettings.success,
      actions.saveSettings.failure,
      actions.saveSettings.cancel,
      actions.loadSettings.success,
      actions.loadSettings.failure,
      actions.loadSettings.cancel,
    ],
    (_state, _action) => false,
  )

const isLoaded = createReducer(initialState.isLoaded)
  .handleAction(actions.loadSettings.success, (_state, _action) => true)
  .handleAction(
    [actions.loadSettings.failure, actions.loadSettings.cancel],
    (_state, _action) => false,
  )

const loadingDidFail = createReducer(initialState.loadingDidFail)
  .handleAction([actions.loadSettings.success], (_state, _action) => false)
  .handleAction(
    [actions.loadSettings.failure, actions.loadSettings.cancel],
    (_state, _action) => true,
  )

export default combineReducers({
  data,
  isLoading,
  isLoaded,
  loadingDidFail,
})
