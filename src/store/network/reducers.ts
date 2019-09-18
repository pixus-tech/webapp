import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

export const initialState = {
  isInitialized: true,
}

const isInitialized = createReducer(initialState.isInitialized)

export default combineReducers({
  isInitialized,
})
