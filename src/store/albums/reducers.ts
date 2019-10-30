import { Map } from 'immutable'
import { combineReducers } from 'redux'
import { createReducer } from 'typesafe-actions'

import Album from 'models/album'

import * as actions from './actions'
import { acceptInvitation } from 'store/sharing/actions'

export const initialState = {
  data: Map<string, Album>(),
}

const data = createReducer(initialState.data)
  .handleAction(acceptInvitation.success, (state, action) => {
    const album = action.payload
    return state.set(album._id, album)
  })
  .handleAction(actions.addAlbum.success, (state, action) => {
    const album = action.payload
    return state.set(album._id, album)
  })
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
  .handleAction(actions.updateAlbum.request, (state, action) => {
    const { album, updates } = action.payload
    return state.set(album._id, { ...album, ...updates })
  })

export default combineReducers({
  data,
})
