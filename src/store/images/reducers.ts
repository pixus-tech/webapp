import { List, Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Image from 'models/image'

import { addImageFileToAlbum, getImages } from './actions'

export const initialState = {
  map: Map<string, Image>(),
}

const map = createReducer(initialState.map)
  .handleAction(getImages.success, (state, action) => {
    return Map(action.payload.map(image => [image._id, image]))
  })
  .handleAction(addImageFileToAlbum.success, (state, action) => {
    return state.set(action.payload.image._id, action.payload.image)
  })

export default combineReducers({
  map,
})
