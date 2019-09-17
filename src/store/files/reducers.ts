import { OrderedMap } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import {
  _dequeueReadFile,
  _enqueueReadFile,
  _performReadFile,
  readFile,
} from './actions'
import { FileHandle } from 'models/fileHandle'

export const initialState = {
  fileQueue: OrderedMap<string, FileHandle>(),
  numberOfActiveFileReads: 0,
}

const fileQueue = createReducer(initialState.fileQueue)
  .handleAction(_enqueueReadFile, (state, action) => {
    return state.set(action.payload._id, action.payload)
  })
  .handleAction(_performReadFile, (state, action) => {
    return state.delete(action.payload._id)
  })
  .handleAction(readFile.cancel, (state, action) => {
    return state.delete(action.payload)
  })

const numberOfActiveFileReads = createReducer(
  initialState.numberOfActiveFileReads,
)
  .handleAction(_performReadFile, (state, _action) => {
    return state + 1
  })
  .handleAction(
    [readFile.success, readFile.failure, readFile.cancel],
    (state, _action) => {
      return state - 1
    },
  )

export default combineReducers({
  fileQueue,
  numberOfActiveFileReads,
})
