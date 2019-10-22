import { createAsyncAction, createStandardAction } from 'typesafe-actions'

import Album from 'models/album'
import { API } from 'typings/types'

export const getAlbums = createStandardAction('ALBUMS__GET_LIST')<undefined>()

export const refreshAlbumsCache = createAsyncAction(
  'ALBUMS__REFRESH_CACHE__REQUEST',
  'ALBUMS__REFRESH_CACHE__SUCCESS',
  'ALBUMS__REFRESH_CACHE__FAILURE',
  'ALBUMS__REFRESH_CACHE__CANCEL',
)<
  undefined,
  API.ShowResponse<undefined>,
  API.ErrorResponse<undefined>,
  undefined
>()

export const getAlbumsFromCache = createAsyncAction(
  'ALBUMS__FROM_CACHE__REQUEST',
  'ALBUMS__FROM_CACHE__SUCCESS',
  'ALBUMS__FROM_CACHE__FAILURE',
  'ALBUMS__FROM_CACHE__CANCEL',
)<
  undefined,
  API.ShowResponse<Album[]>,
  API.ErrorResponse<undefined>,
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

interface SetAlbumImageColumnCountRequest {
  album: Album
  numberOfImageColumns: number
}

export const setAlbumImageColumnCount = createAsyncAction(
  'ALBUMS__SET_IMAGE_COLUMN_COUNT__REQUEST',
  'ALBUMS__SET_IMAGE_COLUMN_COUNT__SUCCESS',
  'ALBUMS__SET_IMAGE_COLUMN_COUNT__FAILURE',
  'ALBUMS__SET_IMAGE_COLUMN_COUNT__CANCEL',
)<
  SetAlbumImageColumnCountRequest,
  API.PutResponse<Album>,
  API.ErrorResponse<SetAlbumImageColumnCountRequest>,
  undefined
>()
