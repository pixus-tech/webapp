import { Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Album from 'models/album'

import * as actions from './actions'

export const initialState = {
  map: Map<string, Album>(),
}

const map = createReducer(initialState.map)
  .handleAction(actions.addAlbum.success, (state, action) => {
    // TODO: should really use the request here
    const album = action.payload.resource
    return state.set(album._id, album)
  })
  /* .handleAction(addAlbum.failure, (state, action) => { // TODO: should be in again
   *   const album = action.payload.resource
   *   return state.remove(album._id)
   * }) */
  .handleAction(actions.getAlbumTree.success, (state, action) => {
    return Map(action.payload.map(album => [album._id, album]))
  })
  .handleAction(actions.upsertAlbum, (state, action) => {
    const album = action.payload
    return state.set(album._id, album)
  })
  .handleAction(actions.setParentAlbum.request, (state, action) => {
    const album = action.payload.album
    const parentAlbumId = action.payload.parentAlbum._id
    return state.set(album._id, {
      ...album,
      parentAlbumId,
    })
  })
  .handleAction(actions.saveAlbum.request, (state, action) =>
    state.set(action.payload._id, action.payload),
  )

export default combineReducers({
  map,
})
