import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'
import Album from 'models/album'
import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import Image, { ImageMetaData } from 'models/image'

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
  {
    album: Album
    fileHandle: FileHandle
  }
>()

interface DownloadPreviewImageRequest {
  album: Album
  image: Image
}

export const downloadPreviewImage = createAsyncAction(
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__REQUEST',
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__SUCCESS',
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__FAILURE',
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__CANCEL',
)<
  DownloadPreviewImageRequest,
  {
    image: Image
    fileContent: ArrayBuffer | string
  },
  API.ErrorResponse<Image>,
  DownloadPreviewImageRequest
>()

// private actions

const _processImage = createStandardAction('IMAGES__PROCESS_IMAGE')<{
  album: Album
  fileHandle: FileHandleWithData
}>()

interface UploadImageDataRequest {
  album: Album
  fileHandle: FileHandleWithData
  imageMetaData: ImageMetaData
}

const _uploadImageData = createAsyncAction(
  'IMAGES__UPLOAD_DATA__REQUEST',
  'IMAGES__UPLOAD_DATA__SUCCESS',
  'IMAGES__UPLOAD_DATA__FAILURE',
  'IMAGES__UPLOAD_DATA__CANCEL',
)<UploadImageDataRequest, undefined, undefined, UploadImageDataRequest>()

interface CreateImageRecordRequest {
  album: Album
  fileHandle: FileHandleWithData
  imageMetaData: ImageMetaData
  username: string
}

const _createImageRecord = createAsyncAction(
  'IMAGES__CREATE_IMAGE_RECORD__REQUEST',
  'IMAGES__CREATE_IMAGE_RECORD__SUCCESS',
  'IMAGES__CREATE_IMAGE_RECORD__FAILURE',
  'IMAGES__CREATE_IMAGE_RECORD__CANCEL',
)<CreateImageRecordRequest, undefined, undefined, CreateImageRecordRequest>()

export const privateActions = {
  _processImage,
  _uploadImageData,
  _createImageRecord,
}
