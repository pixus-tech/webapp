import { Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Album from 'models/album'

import * as actions from './actions'

export const initialState = {
  data: Map<string, Album>(),
}

const data = createReducer(initialState.data)
  .handleAction(actions.addAlbum.success, (state, action) => {
    // TODO: should really use the request here
    const album = action.payload.resource
    return state.set(album._id, album)
  })
  /* .handleAction(addAlbum.failure, (state, action) => { // TODO: should be in again
   *   const album = action.payload.resource
   *   return state.remove(album._id)
   * }) */
  .handleAction(actions.getAlbumsFromCache.success, (state, action) => {
    return Map(action.payload.map(album => [album._id, album]))
  })
  .handleAction(actions.setAlbumPosition.request, (state, action) => {
    const { album, index, parentId } = action.payload
    return state.set(album._id, {
      ...album,
      meta: {
        ...album.meta,
        parentId,
        index,
      },
    })
  })
  .handleAction(actions.saveAlbum.request, (state, action) =>
    state.set(action.payload._id, action.payload),
  )

export default combineReducers({
  data,
})
