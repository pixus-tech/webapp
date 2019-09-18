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

import { FileHandle } from 'models/fileHandle'
import Image, { imagePreviewUploadPath, imageUploadPath } from 'models/image'
import { UploadData } from 'store/network/types'
import { enqueueAction } from 'utils/queue'
import { Queue } from 'store/queue/types'

export const getAlbumImagesEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.getAlbumImages.request)),
    mergeMap(action =>
      images.getAlbumImages(action.payload).pipe(
        map(images => actions.getAlbumImages.success({ album: action.payload, images })),
        takeUntil(action$.pipe(filter(isActionOf(actions.getAlbumImages.cancel)))),
        catchError(error =>
          of(actions.getAlbumImages.failure({ error, resource: action.payload })),
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
    map(action =>
      enqueueAction<FileHandle, typeof readFile.request>(
        Queue.ReadFile,
        readFile.request,
        action.payload.fileHandle
      ))
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
              successAction.payload.data._id === action.payload.fileHandle._id,
          ),
          take(1),
          map(readerAction =>
            actions.processImage({
              album: action.payload.album,
              fileHandle: readerAction.payload.data,
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(readFile.failure)),
          filter(
            errorAction =>
              errorAction.payload.data.resource._id ===
              action.payload.fileHandle._id,
          ),
          take(1),
          map(errorAction =>
            actions.addImageFileToAlbum.failure({
              error: errorAction.payload.data.error,
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
          mergeMap(cancelAction => of(readFile.cancel({ jobId: cancelAction.payload }))), // TODO: this is not the correct id
        ),
      ),
    ),
  )

export const processImageEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.processImage)),
    mergeMap(action =>
      images.processImage(action.payload.fileHandle.objectURL).pipe(
        map(imageMetaData =>
          actions.uploadImageData({
            album: action.payload.album,
            fileHandle: action.payload.fileHandle,
            imageMetaData,
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
        enqueueAction<UploadData, typeof upload.request>(Queue.Upload, upload.request, {
          id: imageId,
          path: imageUploadPath(imageId),
          payload: action.payload.fileHandle.payload,
        }),
        enqueueAction<UploadData, typeof upload.request>(Queue.Upload, upload.request, {
          id: imageId,
          path: imagePreviewUploadPath(imageId),
          payload: action.payload.imageMetaData.previewObjectURL,
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
              successAction.payload.data.id === action.payload.fileHandle._id,
          ),
          bufferCount(2),
          take(1),
          map(([uploadAction]) =>
            actions.createImageRecord({
              album: action.payload.album,
              fileHandle: action.payload.fileHandle,
              imageMetaData: action.payload.imageMetaData,
              username: uploadAction.payload.data.uploader,
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(upload.failure)),
          filter(
            errorAction =>
              errorAction.payload.data.resource.id === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(errorAction => {
            return of(
              actions.addImageFileToAlbum.failure({
                error: errorAction.payload.data.error,
                resource: action.payload,
              }),
              upload.cancel({ jobId: errorAction.payload.jobId }),
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
          mergeMap(cancelAction => of(upload.cancel({ jobId: cancelAction.payload }))),
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
        albumIds: [action.payload.album._id],
        _id: action.payload.fileHandle._id,
        height: action.payload.imageMetaData.height,
        name: action.payload.fileHandle.file.name,
        previewColors: action.payload.imageMetaData.previewColors,
        type: action.payload.fileHandle.file.type,
        username: action.payload.username,
        width: action.payload.imageMetaData.width,
      }

      // TODO: Also add image/album association here
      return images.createImageRecord(image, action.payload.album).pipe(
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
