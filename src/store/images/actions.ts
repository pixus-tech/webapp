import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'
import Album from 'models/album'
import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import Image, { ImagePreview } from 'models/image'

interface AlbumImageFiles {
  album: Album
  imageFiles: File[]
}

export const addImageFilesToAlbum = createStandardAction(
  'IMAGES__ADD_IMAGE_FILES_TO_ALBUM',
)<AlbumImageFiles>()

interface AlbumFileHandle {
  album: Album
  fileHandle: FileHandle
}

interface AddImageToAlbumSuccessResponseData {
  album: Album
  image: Image
}

export const addImageFileToAlbum = createAsyncAction(
  'IMAGES__ADD_IMAGE_FILE_TO_ALBUM__REQUEST',
  'IMAGES__ADD_IMAGE_FILE_TO_ALBUM__SUCCESS',
  'IMAGES__ADD_IMAGE_FILE_TO_ALBUM__FAILURE',
  'IMAGES__ADD_IMAGE_FILE_TO_ALBUM__CANCEL',
)<
  AlbumFileHandle,
  AddImageToAlbumSuccessResponseData,
  API.ErrorResponse<AlbumFileHandle>,
  string
>()

interface GenerateImagePreviewRequestData {
  album: Album
  fileHandle: FileHandleWithData
}

export const generateImagePreview = createStandardAction(
  'IMAGES__GENERATE_PREVIEW',
)<GenerateImagePreviewRequestData>()

interface UploadImageDataRequestData {
  album: Album
  fileHandle: FileHandleWithData
  imagePreview: ImagePreview
}

export const uploadImageData = createStandardAction('IMAGES__UPLOAD_DATA')<
  UploadImageDataRequestData
>()

interface CreateImageRecordRequestData {
  album: Album
  fileHandle: FileHandleWithData
  imagePreview: ImagePreview
  uploadURL: string
}

export const createImageRecord = createStandardAction(
  'IMAGES__CREATE_IMAGE_RECORD',
)<CreateImageRecordRequestData>()

export const getImages = createAsyncAction(
  'IMAGES__LIST_REQUEST',
  'IMAGES__LIST_SUCCESS',
  'IMAGES__LIST_FAILURE',
  'IMAGES__LIST_CANCEL',
)<
  undefined,
  API.ShowResponse<Image[]>,
  API.ErrorResponse<null>,
  API.ResourceFilter
>()
