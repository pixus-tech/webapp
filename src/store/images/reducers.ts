import { List, Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Image from 'models/image'

import { addImageFileToAlbum, getAlbumImages } from './actions'

export const initialState = {
  data: Map<string, Image>(),
  albumImageIds: Map<string, List<string>>(),
}

const data = createReducer(initialState.data)
  .handleAction(getAlbumImages.success, (state, action) => {
    return Map(action.payload.images.map(image => [image._id, image]))
  })
  .handleAction(addImageFileToAlbum.success, (state, action) => {
    const image = action.payload.image
    return state.set(image._id, image)
  })

const albumImageIds = createReducer(initialState.albumImageIds)
  .handleAction(getAlbumImages.success, (state, action) => {
    const imageIds = List<string>(action.payload.images.map(image => image._id))
    return state.set(action.payload.album._id, imageIds)
  })
  .handleAction(addImageFileToAlbum.success, (state, action) => {
    const albumId = action.payload.album._id
    const imageId = action.payload.image._id
    const imageIds = state.get(albumId) || List<string>()
    return state.set(action.payload.album._id, imageIds.push(imageId))
  })

export default combineReducers({
  albumImageIds,
  data,
})
