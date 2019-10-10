import { List, Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Image from 'models/image'

import * as actions from './actions'

export const initialState = {
  albumImageIds: Map<string, List<string>>(),
  data: Map<string, Image>(),
  imageIsLoadingMap: Map<string, boolean>(),
  imageObjectURLMap: Map<string, string>(),
  previewImageIsLoadingMap: Map<string, boolean>(),
  previewImageObjectURLMap: Map<string, string>(),
}

const data = createReducer(initialState.data)
  .handleAction(actions.getAlbumImages.success, (state, action) => {
    return Map(action.payload.images.map(image => [image._id, image]))
  })
  .handleAction([actions.uploadImageToAlbum.success, actions.didProcessImage], (state, action) => {
    const image = action.payload.image
    return state.set(image._id, image)
  })

const albumImageIds = createReducer(initialState.albumImageIds)
  .handleAction(actions.getAlbumImages.success, (state, action) => {
    const imageIds = List<string>(action.payload.images.map(image => image._id))
    return state.set(action.payload.album._id, imageIds)
  })
  .handleAction([actions.didProcessImage], (state, action) => {
    const albumId = action.payload.album._id
    const imageId = action.payload.image._id
    const imageIds = state.get(albumId) || List<string>()
    return state.set(action.payload.album._id, imageIds.push(imageId))
  })

const imageObjectURLMap = createReducer(
  initialState.imageObjectURLMap,
)
  .handleAction(actions.downloadImage.success, (state, action) => {
  const { image, fileContent } = action.payload
  let blob: string | Blob
  if (typeof fileContent === 'string') {
    blob = fileContent
  } else {
    blob = new Blob([fileContent], { type: image.type })
  }
  const objectURL = URL.createObjectURL(blob)
  return state.set(image._id, objectURL)
})
  .handleAction(actions.didProcessImage, (state, action) => {
  const { image, imageData } = action.payload
  const blob = new Blob([imageData], { type: image.type })
  const objectURL = URL.createObjectURL(blob)
  return state.set(image._id, objectURL)
})

const imageIsLoadingMap = createReducer(initialState.imageIsLoadingMap)
  .handleAction(actions.downloadImage.request, (state, action) => {
    return state.set(action.payload.image._id, true)
  })
  .handleAction(actions.downloadImage.success, (state, action) => {
    return state.delete(action.payload.image._id)
  })
  .handleAction(actions.downloadImage.failure, (state, action) => {
    return state.delete(action.payload.resource._id)
  })
  .handleAction(actions.downloadImage.cancel, (state, action) => {
    return state.delete(action.payload.image._id)
  })

const previewImageObjectURLMap = createReducer(
  initialState.previewImageObjectURLMap,
)
  .handleAction(actions.downloadPreviewImage.success, (state, action) => {
  const { image, fileContent } = action.payload
  let blob: string | Blob
  if (typeof fileContent === 'string') {
    blob = fileContent
  } else {
    blob = new Blob([fileContent], { type: image.type })
  }
  const objectURL = URL.createObjectURL(blob)
  return state.set(image._id, objectURL)
})
  .handleAction(actions.didProcessImage, (state, action) => {
  const { image, previewData } = action.payload
  const blob = new Blob([previewData], { type: image.type })
  const objectURL = URL.createObjectURL(blob)
  return state.set(image._id, objectURL)
})

const previewImageIsLoadingMap = createReducer(
  initialState.previewImageIsLoadingMap,
)
  .handleAction(actions.downloadPreviewImage.request, (state, action) => {
    return state.set(action.payload.image._id, true)
  })
  .handleAction(actions.downloadPreviewImage.success, (state, action) => {
    return state.delete(action.payload.image._id)
  })
  .handleAction(actions.downloadPreviewImage.failure, (state, action) => {
    return state.delete(action.payload.resource._id)
  })
  .handleAction(actions.downloadPreviewImage.cancel, (state, action) => {
    return state.delete(action.payload.image._id)
  })

export default combineReducers({
  albumImageIds,
  data,
  imageObjectURLMap,
  imageIsLoadingMap,
  previewImageObjectURLMap,
  previewImageIsLoadingMap,
})
