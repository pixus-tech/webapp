import _ from 'lodash'
import { Epic } from 'redux-observable'
import { of, race, forkJoin } from 'rxjs'
import {
  bufferCount,
  tap,
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
  ignoreElements,
  take,
  takeUntil,
} from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'
import uuid from 'uuid/v4'

import * as actions from './actions'
import { upload } from '../network/actions'
import { readFile } from '../files/actions'

import { MAX_CONCURRENT_UPLOADS } from 'constants/index'
import { FileHandle } from 'models/fileHandle'
import Image, { imagePreviewUploadPath, imageUploadPath } from 'models/image'

export const getImagesEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.getImages.request)),
    mergeMap(action =>
      images.getImages().pipe(
        map(actions.getImages.success),
        takeUntil(action$.pipe(filter(isActionOf(actions.getImages.cancel)))),
        catchError(error =>
          of(actions.getImages.failure({ error, resource: null })),
        ),
      ),
    ),
  )

export const addImageFilesToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.addImageFilesToAlbum)),
    mergeMap(action => {
      const { album } = action.payload

      const resultActions: RootAction[] = _.map(
        action.payload.imageFiles,
        imageFile => {
          const fileHandle: FileHandle = {
            _id: uuid(),
            file: imageFile,
            type: imageFile.type,
          }

          return actions.addImageFileToAlbum.request({ album, fileHandle })
        },
      )

      return of(...resultActions)
    }),
  )

export const triggerImageFileReadEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.addImageFileToAlbum.request)),
    map(action => readFile.request(action.payload.fileHandle)),
  )

export const addImageFileToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.addImageFileToAlbum.request)),
    mergeMap(action =>
      race(
        action$.pipe(
          filter(isActionOf(readFile.success)),
          filter(
            successAction =>
              successAction.payload._id === action.payload.fileHandle._id,
          ),
          take(1),
          map(readerAction =>
            actions.generateImagePreview({
              album: action.payload.album,
              fileHandle: readerAction.payload,
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(readFile.failure)),
          filter(
            errorAction =>
              errorAction.payload.resource._id ===
              action.payload.fileHandle._id,
          ),
          take(1),
          map(errorAction =>
            actions.addImageFileToAlbum.failure({
              error: errorAction.payload.error,
              resource: action.payload,
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(actions.addImageFileToAlbum.cancel)),
          filter(
            cancelAction =>
              cancelAction.payload === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(cancelAction => of(readFile.cancel(cancelAction.payload))),
        ),
      ),
    ),
  )

export const generateImagePreviewEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.generateImagePreview)),
    mergeMap(action =>
      images.generateImagePreview(action.payload.fileHandle.objectURL).pipe(
        map(imagePreview =>
          actions.uploadImageData({
            album: action.payload.album,
            fileHandle: action.payload.fileHandle,
            imagePreview,
          }),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.addImageFileToAlbum.cancel)),
            filter(
              cancelAction =>
                cancelAction.payload === action.payload.fileHandle._id,
            ),
          ),
        ),
        catchError(error =>
          of(
            actions.addImageFileToAlbum.failure({
              error,
              resource: action.payload,
            }),
          ),
        ),
      ),
    ),
  )

export const triggerUploadImageDataEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageData)),
    mergeMap(action => {
      const imageId = action.payload.fileHandle._id
      return of(
        upload.request({
          id: imageId,
          path: imageUploadPath(imageId),
          payload: action.payload.fileHandle.payload,
        }),
        upload.request({
          id: imageId,
          path: imagePreviewUploadPath(imageId),
          payload: action.payload.imagePreview.objectURL,
        }),
      )
    }),
  )

export const uploadImageDataEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageData)),
    mergeMap(action =>
      race(
        action$.pipe(
          filter(isActionOf(upload.success)),
          filter(
            successAction =>
              successAction.payload.id === action.payload.fileHandle._id,
          ),
          bufferCount(2),
          take(1),
          map(([uploadAction]) =>
            actions.createImageRecord({
              album: action.payload.album,
              fileHandle: action.payload.fileHandle,
              imagePreview: action.payload.imagePreview,
              uploadURL: uploadAction.payload.path, // TODO: get gaia upload url here
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(upload.failure)),
          filter(
            errorAction =>
              errorAction.payload.resource.id === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(errorAction => {
            return of(
              actions.addImageFileToAlbum.failure({
                error: errorAction.payload.error,
                resource: action.payload,
              }),
              upload.cancel(errorAction.payload.resource.id),
            )
          }),
        ),
        action$.pipe(
          filter(isActionOf(actions.addImageFileToAlbum.cancel)),
          filter(
            cancelAction =>
              cancelAction.payload === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(cancelAction => of(upload.cancel(cancelAction.payload))),
        ),
      ),
    ),
  )

export const createImageRecordEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.createImageRecord)),
    mergeMap(action => {
      const image: Image = {
        _id: action.payload.fileHandle._id,
        previewColors: action.payload.imagePreview.colors,
        name: action.payload.fileHandle.file.name,
        type: action.payload.fileHandle.file.type,
        gaiaURL: action.payload.uploadURL, // TODO: strip file path
      }

      // TODO: Also add image/album association here
      return images.saveImage(image).pipe(
        map(_imageRecord =>
          actions.addImageFileToAlbum.success({
            album: action.payload.album,
            image,
          }),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.addImageFileToAlbum.cancel)),
            filter(
              cancelAction =>
                cancelAction.payload === action.payload.fileHandle._id,
            ),
          ),
        ),
        catchError(error =>
          of(
            actions.addImageFileToAlbum.failure({
              error,
              resource: action.payload,
            }),
          ),
        ),
      )
    }),
  )
