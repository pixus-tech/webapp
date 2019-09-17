import { createAsyncAction, createStandardAction } from 'typesafe-actions'

import Album from 'models/album'
import { API } from 'typings/types'

export const getAlbumTree = createAsyncAction(
  'ALBUMS__LIST_REQUEST',
  'ALBUMS__LIST_SUCCESS',
  'ALBUMS__LIST_FAILURE',
  'ALBUMS__LIST_CANCEL',
)<
  undefined,
  API.ShowResponse<Album[]>,
  API.ErrorResponse<null>,
  API.ResourceFilter
>()

export const addAlbum = createAsyncAction(
  'ALBUMS__ADD_REQUEST',
  'ALBUMS__ADD_SUCCESS',
  'ALBUMS__ADD_FAILURE',
  'ALBUMS__ADD_CANCEL',
)<string, API.PutResponse<Album>, API.ErrorResponse<string>, undefined>()

interface SetParentAlbumRequestSchema {
  album: Album
  parentAlbum: Album
}

export const setParentAlbum = createAsyncAction(
  'ALBUMS__SET_PARENT_REQUEST',
  'ALBUMS__SET_PARENT_SUCCESS',
  'ALBUMS__SET_PARENT_FAILURE',
  'ALBUMS__SET_PARENT_CANCEL',
)<
  SetParentAlbumRequestSchema,
  API.PutResponse<Album>,
  API.ErrorResponse<SetParentAlbumRequestSchema>,
  API.ResourceFilter
>()

export const subscribeAlbumSocket = createStandardAction(
  'ALBUMS__SUBSCRIBE_SOCKET',
)<undefined>()

export const unsubscribeAlbumSocket = createStandardAction(
  'ALBUMS__UNSUBSCRIBE_SOCKET',
)<undefined>()

export const upsertAlbum = createStandardAction('ALBUMS__UPSERT')<Album>()
