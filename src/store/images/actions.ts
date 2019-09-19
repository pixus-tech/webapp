import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'
import Album from 'models/album'
import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import Image, { ImageMetaData } from 'models/image'
import {
  CancelJobPayload,
  createEnqueueableAction,
  QueuePayload,
} from 'utils/queue'

export const getAlbumImages = createAsyncAction(
  'IMAGES__LIST_REQUEST',
  'IMAGES__LIST_SUCCESS',
  'IMAGES__LIST_FAILURE',
  'IMAGES__LIST_CANCEL',
)<
  Album,
  API.ShowResponse<{
    album: Album
    images: Image[]
  }>,
  API.ErrorResponse<Album>,
  API.ResourceFilter
>()

export const uploadImagesToAlbum = createStandardAction(
  'IMAGES__UPLOAD_IMAGES_TO_ALBUM',
)<{
  album: Album
  imageFiles: File[]
}>()

export const uploadImageToAlbum = createAsyncAction(
  'IMAGES__UPLOAD_IMAGE_TO_ALBUM__REQUEST',
  'IMAGES__UPLOAD_IMAGE_TO_ALBUM__SUCCESS',
  'IMAGES__UPLOAD_IMAGE_TO_ALBUM__FAILURE',
  'IMAGES__UPLOAD_IMAGE_TO_ALBUM__CANCEL',
)<
  {
    album: Album
    fileHandle: FileHandle
  },
  {
    album: Album
    image: Image
  },
  API.ErrorResponse<{
    album: Album
    fileHandle: FileHandle
  }>,
  string
>()

export const saveImage = createEnqueueableAction(
  'IMAGES__SAVE_IMAGE__REQUEST',
  'IMAGES__SAVE_IMAGE__SUCCESS',
  'IMAGES__SAVE_IMAGE__FAILURE',
  'IMAGES__SAVE_IMAGE__CANCEL',
)<
  QueuePayload<Image>,
  QueuePayload<Image>,
  QueuePayload<API.ErrorResponse<Image>>,
  CancelJobPayload
>()

// private actions

const _processImage = createStandardAction('IMAGES__PROCESS_IMAGE')<{
  album: Album
  fileHandle: FileHandleWithData
}>()

const _uploadImageData = createStandardAction('IMAGES__UPLOAD_DATA')<{
  album: Album
  fileHandle: FileHandleWithData
  imageMetaData: ImageMetaData
}>()

const _createImageRecord = createStandardAction('IMAGES__CREATE_IMAGE_RECORD')<{
  album: Album
  fileHandle: FileHandleWithData
  imageMetaData: ImageMetaData
  username: string
}>()

export const privateActions = {
  _processImage,
  _uploadImageData,
  _createImageRecord,
}
