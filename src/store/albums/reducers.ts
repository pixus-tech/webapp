import { Map } from 'immutable'
import * as _ from 'lodash'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Album from 'models/album'

import { addAlbum, getAlbumTree, setParentAlbum, upsertAlbum } from './actions'

export const initialState = {
  map: Map<string, Album>(),
  count: 0,
}

const map = createReducer(initialState.map)
  .handleAction(addAlbum.success, (state, action) => {
    // TODO: should really use the request here
    const album = action.payload.resource
    return state.set(album._id, album)
  })
  /* .handleAction(addAlbum.failure, (state, action) => { // TODO: should be in again
   *   const album = action.payload.resource
   *   return state.remove(album._id)
   * }) */
  .handleAction(getAlbumTree.success, (state, action) => {
    return Map(action.payload.map(album => [album._id, album]))
  })
  .handleAction(upsertAlbum, (state, action) => {
    const album = action.payload
    return state.set(album._id, album)
  })
  .handleAction(setParentAlbum.request, (state, action) => {
    const album = action.payload.album
    const parentAlbumId = action.payload.parentAlbum._id
    return state.set(album._id, {
      ...album,
      parentAlbumId,
    })
  })

const count = createReducer(initialState.count)
  .handleAction(getAlbumTree.success, (_state, action) =>
    _.size(action.payload),
  )
  .handleAction(addAlbum.request, (state, action) => state + 1)
  .handleAction(addAlbum.failure, (state, action) => state - 1)
  .handleAction(
    upsertAlbum,
    (state, action) => state + 1, // TODO: Fix the counter for updates
  )

export default combineReducers({
  map,
  count,
})
