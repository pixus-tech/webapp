import { OrderedMap } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import {
  _dequeueUpload,
  _enqueueUpload,
  _performUpload,
  upload,
} from './actions'

import { UploadData } from './types'

export const initialState = {
  uploadQueue: OrderedMap<string, UploadData>(),
  numberOfActiveUploads: 0,
}

const uploadQueue = createReducer(initialState.uploadQueue)
  .handleAction(_enqueueUpload, (state, action) => {
    return state.set(action.payload.path, action.payload)
  })
  .handleAction(_performUpload, (state, action) => {
    return state.delete(action.payload.path)
  })
  .handleAction(upload.cancel, (state, action) => {
    return state.filterNot(data => data.id === action.payload)
  })

const numberOfActiveUploads = createReducer(initialState.numberOfActiveUploads)
  .handleAction(_performUpload, (state, _action) => {
    return state + 1
  })
  .handleAction(
    [upload.success, upload.failure, upload.cancel],
    (state, _action) => {
      return state - 1
    },
  )

export default combineReducers({
  uploadQueue,
  numberOfActiveUploads,
})
