import { createAsyncAction, createStandardAction } from 'typesafe-actions'

import Album from 'models/album'
import { API } from 'typings/types'

export const refreshAlbums = createAsyncAction(
  'ALBUMS__REFRESH_LIST__REQUEST',
  'ALBUMS__REFRESH_LIST__SUCCESS',
  'ALBUMS__REFRESH_LIST__FAILURE',
  'ALBUMS__REFRESH_LIST__CANCEL',
)<undefined, API.ShowResponse<Album[]>, API.ErrorResponse<null>, undefined>()

export const getAlbums = createAsyncAction(
  'ALBUMS__LIST__REQUEST',
  'ALBUMS__LIST__SUCCESS',
  'ALBUMS__LIST__FAILURE',
  'ALBUMS__LIST__CANCEL',
)<
  undefined,
  API.ShowResponse<Album[]>,
  API.ErrorResponse<null>,
  API.ResourceFilter
>()

interface AddAlbumRequest {
  isDirectory: boolean
}

export const addAlbum = createAsyncAction(
  'ALBUMS__ADD__REQUEST',
  'ALBUMS__ADD__SUCCESS',
  'ALBUMS__ADD__FAILURE',
  'ALBUMS__ADD__CANCEL',
)<
  AddAlbumRequest,
  API.PutResponse<Album>,
  API.ErrorResponse<undefined>,
  undefined
>()

export const saveAlbum = createAsyncAction(
  'ALBUMS__SAVE_ALBUM__REQUEST',
  'ALBUMS__SAVE_ALBUM__SUCCESS',
  'ALBUMS__SAVE_ALBUM__FAILURE',
  'ALBUMS__SAVE_ALBUM__CANCEL',
)<Album, Album, API.ErrorResponse<Album>, Album>()

interface RequestSetAlbumPosition {
  album: Album
  successor: Album
}

export const requestSetAlbumPosition = createStandardAction(
  'ALBUMS__REQUEST_SET_POSITION',
)<RequestSetAlbumPosition>()

interface SetAlbumPositionRequest {
  album: Album
  parentId?: string
  index: number
}

export const setAlbumPosition = createAsyncAction(
  'ALBUMS__SET_POSITION__REQUEST',
  'ALBUMS__SET_POSITION__SUCCESS',
  'ALBUMS__SET_POSITION__FAILURE',
  'ALBUMS__SET_POSITION__CANCEL',
)<
  SetAlbumPositionRequest,
  API.PutResponse<Album>,
  API.ErrorResponse<SetAlbumPositionRequest>,
  undefined
>()
