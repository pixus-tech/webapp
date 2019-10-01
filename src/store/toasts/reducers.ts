import { List } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import { Toast } from './types'

import * as actions from './actions'

export const initialState = {
  data: List<Toast>(),
}

const data = createReducer(initialState.data)
  .handleAction(actions.showToast, (state, action) =>
    state.push(action.payload),
  )
  .handleAction(actions.hideToast, (state, action) =>
    state.filter(toast => toast !== action.payload),
  )

export default combineReducers({
  data,
})
