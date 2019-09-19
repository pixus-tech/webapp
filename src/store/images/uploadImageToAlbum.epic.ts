import { Epic } from 'redux-observable'
import { combineEpics } from 'redux-observable'
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
import { privateActions } from './actions'
import { upload } from '../network/actions'
import { readFile } from '../files/actions'

import Image, { imagePreviewUploadPath, imageUploadPath } from 'models/image'
import { FileHandle } from 'models/fileHandle'
import { UploadData } from 'store/network/types'
import { Queue } from 'store/queue/types'
import { enqueueAction } from 'utils/queue'

const _0_requestReadImageFile: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageToAlbum.request)),
    map(action =>
      enqueueAction<FileHandle, typeof readFile.request>(
        Queue.ReadFile,
        readFile.request,
        action.payload.fileHandle,
      ),
    ),
  )

const _1_imageFileResult: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageToAlbum.request)),
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
            privateActions._processImage({
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
            actions.uploadImageToAlbum.failure({
              error: errorAction.payload.data.error,
              resource: action.payload,
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(actions.uploadImageToAlbum.cancel)),
          filter(
            cancelAction =>
              cancelAction.payload === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(cancelAction =>
            of(readFile.cancel({ jobId: cancelAction.payload })),
          ), // TODO: this is not the correct id
        ),
      ),
    ),
  )

const _2_processImage: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(privateActions._processImage)),
    mergeMap(action =>
      images.processImage(action.payload.fileHandle.objectURL).pipe(
        map(imageMetaData =>
          privateActions._uploadImageData({
            album: action.payload.album,
            fileHandle: action.payload.fileHandle,
            imageMetaData,
          }),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.uploadImageToAlbum.cancel)),
            filter(
              cancelAction =>
                cancelAction.payload === action.payload.fileHandle._id,
            ),
          ),
        ),
        catchError(error =>
          of(
            actions.uploadImageToAlbum.failure({
              error,
              resource: action.payload,
            }),
          ),
        ),
      ),
    ),
  )

const _3_requestImageDataUpload: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(privateActions._uploadImageData)),
    mergeMap(action => {
      const imageId = action.payload.fileHandle._id
      return of(
        enqueueAction<UploadData, typeof upload.request>(
          Queue.Upload,
          upload.request,
          {
            id: imageId,
            path: imageUploadPath(imageId),
            payload: action.payload.fileHandle.payload,
          },
        ),
        enqueueAction<UploadData, typeof upload.request>(
          Queue.Upload,
          upload.request,
          {
            id: imageId,
            path: imagePreviewUploadPath(imageId),
            payload: action.payload.imageMetaData.previewObjectURL,
          },
        ),
      )
    }),
  )

const _4_imageDataUploadResult: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(privateActions._uploadImageData)),
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
            privateActions._createImageRecord({
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
              errorAction.payload.data.resource.id ===
              action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(errorAction => {
            return of(
              actions.uploadImageToAlbum.failure({
                error: errorAction.payload.data.error,
                resource: action.payload,
              }),
              upload.cancel({ jobId: errorAction.payload.jobId }),
            )
          }),
        ),
        action$.pipe(
          filter(isActionOf(actions.uploadImageToAlbum.cancel)),
          filter(
            cancelAction =>
              cancelAction.payload === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(cancelAction =>
            of(upload.cancel({ jobId: cancelAction.payload })),
          ),
        ),
      ),
    ),
  )

// TODO: request and queue
const _5_requestPersistImageRecord: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(privateActions._createImageRecord)),
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

      return of(
        enqueueAction<Image, typeof actions.saveImage.request>(
          Queue.RecordOperation,
          actions.saveImage.request,
          image,
        ),
      )
    }),
  )

const _6_persistImageRecordResult: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(privateActions._createImageRecord)),
    mergeMap(action =>
      race(
        action$.pipe(
          filter(isActionOf(actions.saveImage.success)),
          filter(
            successAction =>
              successAction.payload.data._id === action.payload.fileHandle._id,
          ),
          take(1),
          map(successAction =>
            actions.uploadImageToAlbum.success({
              album: action.payload.album,
              image: successAction.payload.data,
            }),
          ),
        ),
        action$.pipe(
          filter(isActionOf(actions.saveImage.failure)),
          filter(
            errorAction =>
              errorAction.payload.data.resource._id ===
              action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(errorAction => {
            return of(
              actions.uploadImageToAlbum.failure({
                error: errorAction.payload.data.error,
                resource: action.payload,
              }),
            )
          }),
        ),
        action$.pipe(
          filter(isActionOf(actions.uploadImageToAlbum.cancel)),
          filter(
            cancelAction =>
              cancelAction.payload === action.payload.fileHandle._id,
          ),
          take(1),
          mergeMap(cancelAction =>
            of(actions.saveImage.cancel({ jobId: cancelAction.payload })),
          ),
        ),
      ),
    ),
  )

export const uploadImageToAlbumEpic = combineEpics(
  _0_requestReadImageFile,
  _1_imageFileResult,
  _2_processImage,
  _3_requestImageDataUpload,
  _4_imageDataUploadResult,
  _5_requestPersistImageRecord,
  _6_persistImageRecordResult,
)
