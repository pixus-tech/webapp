import { List, Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Image from 'models/image'

import * as actions from './actions'
import { keyForFilter } from './types'

export const initialState = {
  filterImagesLoaded: Map<Map<string, any>, boolean>(),
  filterImageIds: Map<Map<string, any>, List<string>>(),
  currentUploads: Map<string, boolean>(),
  data: Map<string, Image>(),
  failedUploads: Map<string, Error>(),
  imageIsLoadingMap: Map<string, boolean>(),
  imageObjectURLMap: Map<string, string>(),
  previewImageIsLoadingMap: Map<string, boolean>(),
  previewImageObjectURLMap: Map<string, string>(),
  succeededUploads: Map<string, boolean>(),
}

const filterImagesLoaded = createReducer(
  initialState.filterImagesLoaded,
).handleAction(actions.getImagesFromCache.success, (state, action) => {
  const key = keyForFilter(action.payload.filter)

  return state.set(key, true)
})

const currentUploads = createReducer(initialState.currentUploads)
  .handleAction(actions.uploadImageToAlbum.request, (state, action) =>
    state.set(action.payload.image._id, true),
  )
  .handleAction(actions.uploadImageToAlbum.cancel, (state, action) =>
    state.delete(action.payload._id),
  )

const failedUploads = createReducer(initialState.failedUploads)
  .handleAction(actions.uploadImageToAlbum.failure, (state, action) =>
    state.set(action.payload.resource.image._id, action.payload.error),
  )
  .handleAction(actions.resumePendingUploads, (_state, _action) => Map())

const succeededUploads = createReducer(
  initialState.succeededUploads,
).handleAction(actions.uploadImageToAlbum.success, (state, action) =>
  state.set(action.payload.image._id, true),
)

const data = createReducer(initialState.data)
  .handleAction(actions.getImagesFromCache.success, (state, action) => {
    return Map(action.payload.images.map(image => [image._id, image]))
  })
  .handleAction(actions.deleteImage.request, (state, action) =>
    state.delete(action.payload._id),
  )
  .handleAction(actions.addImageToAlbum.success, (state, action) => {
    const image = action.payload.image
    return state.set(image._id, image)
  })
  .handleAction(actions.updateImageMeta.request, (state, action) => {
    const { image, updates } = action.payload
    return state.set(image._id, {
      ...image,
      meta: { ...image.meta, ...updates },
    })
  })

const filterImageIds = createReducer(initialState.filterImageIds)
  .handleAction(actions.getImagesFromCache.success, (state, { payload }) => {
    const imageIds = List<string>(payload.images.map(image => image._id))
    return state.set(keyForFilter(payload.filter), imageIds)
  })
  .handleAction(actions.addImageToAlbum.success, (state, action) => {
    const albumId = action.payload.album._id
    const imageId = action.payload.image._id
    // TODO: Use the current filter
    const key = keyForFilter({
      page: 0,
      perPage: 1000,
      filter: {
        name: 'album',
        data: albumId,
      },
    })
    const imageIds = state.get(key) || List<string>()
    return state.set(key, imageIds.push(imageId))
  })

const imageObjectURLMap = createReducer(
  initialState.imageObjectURLMap,
).handleAction(actions.downloadImage.success, (state, action) => {
  const { image, objectURL } = action.payload
  return state.set(image._id, objectURL)
})

const imageIsLoadingMap = createReducer(initialState.imageIsLoadingMap)
  .handleAction(actions.downloadImage.request, (state, action) => {
    return state.set(action.payload._id, true)
  })
  .handleAction(actions.downloadImage.success, (state, action) => {
    return state.delete(action.payload.image._id)
  })
  .handleAction(actions.downloadImage.failure, (state, action) => {
    return state.delete(action.payload.resource._id)
  })
  .handleAction(actions.downloadImage.cancel, (state, action) => {
    return state.delete(action.payload._id)
  })

const previewImageObjectURLMap = createReducer(
  initialState.previewImageObjectURLMap,
).handleAction(actions.downloadPreviewImage.success, (state, action) => {
  const { image, objectURL } = action.payload
  return state.set(image._id, objectURL)
})

const previewImageIsLoadingMap = createReducer(
  initialState.previewImageIsLoadingMap,
)
  .handleAction(actions.downloadPreviewImage.request, (state, action) => {
    return state.set(action.payload._id, true)
  })
  .handleAction(actions.downloadPreviewImage.success, (state, action) => {
    return state.delete(action.payload.image._id)
  })
  .handleAction(actions.downloadPreviewImage.failure, (state, action) => {
    return state.delete(action.payload.resource._id)
  })
  .handleAction(actions.downloadPreviewImage.cancel, (state, action) => {
    return state.delete(action.payload._id)
  })

export default combineReducers({
  filterImagesLoaded,
  currentUploads,
  data,
  failedUploads,
  filterImageIds,
  imageIsLoadingMap,
  imageObjectURLMap,
  previewImageIsLoadingMap,
  previewImageObjectURLMap,
  succeededUploads,
})
