import { Epic } from 'redux-observable'
import { combineEpics } from 'redux-observable'
import { of } from 'rxjs'
import { catchError, filter, map, mergeMap, takeUntil } from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'
import { privateActions } from './actions'
import { upload, saveRecord } from 'store/network/actions'
import { readFile } from 'store/files/actions'

import { FileHandle } from 'models/fileHandle'
import {
  imagePreviewUploadPath,
  imageUploadPath,
  parseImageRecord,
} from 'models/image'
import { ImageRecordFactory } from 'db/image'
import { cancelJobGroup } from 'store/queue/actions'
import { Queue } from 'store/queue/types'
import { listenToActionStream } from 'utils/queue'

function groupId(fileHandle: FileHandle) {
  return `${fileHandle._id}-uploadImageToAlbum`
}

const _cancelJob: Epic<RootAction, RootAction, RootState> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageToAlbum.cancel)),
    map(cancelAction =>
      cancelJobGroup(groupId(cancelAction.payload.fileHandle)),
    ),
  )

export const _0_requestReadImageFile: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  listenToActionStream(action$, state$)
    .andPerformAction(actions.uploadImageToAlbum)
    .byAsynchronouslyExecuting(readFile)
    .withGroupId(requestData => groupId(requestData.fileHandle))
    .andJobs(requestData => [
      {
        queue: Queue.ReadFile,
        payload: requestData.fileHandle,
      },
    ])
    .andResultCallbacks({
      success: (request, success) => [
        privateActions._processImage({
          album: request.album,
          fileHandle: success,
        }),
      ],
      error: (request, error) => [
        actions.uploadImageToAlbum.failure({
          error: error.error,
          resource: request,
        }),
      ],
    })

const _1_processImage: Epic<
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
          privateActions._uploadImageData.request({
            album: action.payload.album,
            fileHandle: action.payload.fileHandle,
            imageMetaData,
          }),
        ),
        catchError(error =>
          of(
            actions.uploadImageToAlbum.failure({
              error,
              resource: action.payload,
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.uploadImageToAlbum.cancel)),
            filter(
              cancelAction =>
                groupId(cancelAction.payload.fileHandle) ===
                groupId(action.payload.fileHandle),
            ),
          ),
        ),
      ),
    ),
  )

export const _2_uploadImageData: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  listenToActionStream(action$, state$)
    .andPerformAction(privateActions._uploadImageData)
    .byAsynchronouslyExecuting(upload)
    .withGroupId(requestData => groupId(requestData.fileHandle))
    .andJobs(requestData => {
      const imageId = requestData.fileHandle._id
      const key = requestData.album.publicKey
      return [
        {
          queue: Queue.Upload,
          payload: {
            id: imageId,
            path: imageUploadPath(imageId),
            payload: requestData.fileHandle.payload,
            key,
          },
        },
        {
          queue: Queue.Upload,
          payload: {
            id: imageId,
            path: imagePreviewUploadPath(imageId),
            payload: requestData.imageMetaData.previewImageData,
            key,
          },
        },
      ]
    })
    .andResultCallbacks({
      success: (request, success) => [
        privateActions._createImageRecord.request({
          album: request.album,
          fileHandle: request.fileHandle,
          imageMetaData: request.imageMetaData,
          username: success.uploader,
        }),
      ],
      error: (request, error) => [
        actions.uploadImageToAlbum.failure({
          error: error.error,
          resource: request,
        }),
        upload.cancel({ groupId: groupId(request.fileHandle) }),
      ],
    })

export const _3_persistImageRecord: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  listenToActionStream(action$, state$)
    .andPerformAction(privateActions._createImageRecord)
    .byAsynchronouslyExecuting(saveRecord)
    .withGroupId(requestData => groupId(requestData.fileHandle))
    .andJobs(requestData => [
      {
        queue: Queue.RecordOperation,
        payload: ImageRecordFactory.build({
          albumIds: [requestData.album._id],
          _id: requestData.fileHandle._id,
          height: requestData.imageMetaData.height,
          name: requestData.fileHandle.file.name,
          previewColors: requestData.imageMetaData.previewColors,
          type: requestData.fileHandle.file.type,
          userGroupId: requestData.album._id,
          username: requestData.username,
          width: requestData.imageMetaData.width,
        }),
      },
    ])
    .andResultCallbacks({
      success: (request, success) => [
        actions.uploadImageToAlbum.success({
          album: request.album,
          image: parseImageRecord(success),
        }),
      ],
      error: (request, error) => [
        actions.uploadImageToAlbum.failure({
          error: error.error,
          resource: request,
        }),
      ],
    })

export const uploadImageToAlbumEpic = combineEpics(
  _cancelJob,
  _0_requestReadImageFile,
  _1_processImage,
  _2_uploadImageData,
  _3_persistImageRecord,
)
