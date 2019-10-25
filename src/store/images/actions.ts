import { Buffer } from 'buffer'
import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'
import Album from 'models/album'
import { FileHandle } from 'models/fileHandle'
import Image from 'models/image'
import { FilteredImages, ImageFilter } from './types'

export const getImages = createStandardAction('IMAGES__GET_LIST')<ImageFilter>()

export const refreshImagesCache = createAsyncAction(
  'IMAGES__REFRESH_CACHE__REQUEST',
  'IMAGES__REFRESH_CACHE__SUCCESS',
  'IMAGES__REFRESH_CACHE__FAILURE',
  'IMAGES__REFRESH_CACHE__CANCEL',
)<ImageFilter, ImageFilter, API.ErrorResponse<ImageFilter>, ImageFilter>()

export const getImagesFromCache = createAsyncAction(
  'IMAGES__FROM_CACHE__REQUEST',
  'IMAGES__FROM_CACHE__SUCCESS',
  'IMAGES__FROM_CACHE__FAILURE',
  'IMAGES__FROM_CACHE__CANCEL',
)<ImageFilter, FilteredImages, API.ErrorResponse<ImageFilter>, ImageFilter>()

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

export const didProcessImage = createStandardAction('IMAGES__PROCESSED_IMAGE')<{
  album: Album
  image: Image
  imageData: ArrayBuffer
  previewData: ArrayBuffer
}>()

interface DownloadImageResult {
  image: Image
  fileContent: Buffer | string
}

export const requestDownloadPreviewImage = createStandardAction(
  'IMAGES__REQUEST_DOWNLOAD_PREVIEW_IMAGE',
)<Image>()

export const downloadPreviewImage = createAsyncAction(
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__REQUEST',
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__SUCCESS',
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__FAILURE',
  'IMAGES__DOWNLOAD_PREVIEW_IMAGE__CANCEL',
)<Image, DownloadImageResult, API.ErrorResponse<Image>, Image>()

export const requestDownloadImage = createStandardAction(
  'IMAGES__REQUEST_DOWNLOAD_IMAGE',
)<Image>()

export const downloadImage = createAsyncAction(
  'IMAGES__DOWNLOAD_IMAGE__REQUEST',
  'IMAGES__DOWNLOAD_IMAGE__SUCCESS',
  'IMAGES__DOWNLOAD_IMAGE__FAILURE',
  'IMAGES__DOWNLOAD_IMAGE__CANCEL',
)<Image, DownloadImageResult, API.ErrorResponse<Image>, Image>()

interface SaveImageResult {
  image: Image
  objectURL: string
}

export const saveImage = createAsyncAction(
  'IMAGES__SAVE__REQUEST',
  'IMAGES__SAVE__SUCCESS',
  'IMAGES__SAVE__FAILURE',
  'IMAGES__SAVE__CANCEL',
)<Image, SaveImageResult, API.ErrorResponse<Image>, Image>()

export const deleteImage = createAsyncAction(
  'IMAGES__DELETE__REQUEST',
  'IMAGES__DELETE__SUCCESS',
  'IMAGES__DELETE__FAILURE',
  'IMAGES__DELETE__CANCEL',
)<Image, Image, API.ErrorResponse<Image>, Image>()

interface UpdateEXIFTagsData {
  image: Image
  imageData: ArrayBuffer
}

export const updateImageEXIFTags = createAsyncAction(
  'IMAGES__UPDATE_EXIF_TAGS__REQUEST',
  'IMAGES__UPDATE_EXIF_TAGS__SUCCESS',
  'IMAGES__UPDATE_EXIF_TAGS__FAILURE',
  'IMAGES__UPDATE_EXIF_TAGS__CANCEL',
)<UpdateEXIFTagsData, Image, API.ErrorResponse<Image>, Image>()

export const toggleImageFavorite = createAsyncAction(
  'IMAGES__TOGGLE_FAVORITE__REQUEST',
  'IMAGES__TOGGLE_FAVORITE__SUCCESS',
  'IMAGES__TOGGLE_FAVORITE__FAILURE',
  'IMAGES__TOGGLE_FAVORITE__CANCEL',
)<Image, API.PutResponse<Image>, API.ErrorResponse<Image>, Image>()
