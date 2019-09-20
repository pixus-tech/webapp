import _ from 'lodash'
import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import { catchError, filter, map, mergeMap, takeUntil } from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'
import uuid from 'uuid/v4'

import * as actions from './actions'
import { ImageRecordFactory } from 'db/image'
import { FileHandle } from 'models/fileHandle'
import { imagePreviewUploadPath } from 'models/image'
import { download, saveRecord } from 'store/network/actions'
import { Queue } from 'store/queue/types'
import { listenToActionStream } from 'utils/queue'

export { uploadImageToAlbumEpic } from './uploadImageToAlbum.epic'

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
        map(images =>
          actions.getAlbumImages.success({ album: action.payload, images }),
        ),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.getAlbumImages.cancel))),
        ),
        catchError(error =>
          of(
            actions.getAlbumImages.failure({ error, resource: action.payload }),
          ),
        ),
      ),
    ),
  )

export const uploadImagesToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImagesToAlbum)),
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

          return actions.uploadImageToAlbum.request({ album, fileHandle })
        },
      )

      return of(...resultActions)
    }),
  )

export const saveImageEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  listenToActionStream(action$)
    .andPerformAction(actions.saveImage)
    .byAsynchronouslyExecuting(saveRecord)
    .withGroupId(requestData => `${requestData._id}-saveImage`)
    .andJobs(requestData => [
      {
        queue: Queue.RecordOperation,
        payload: ImageRecordFactory.build(requestData),
      },
    ])
    .andResultCallbacks({
      success: (request, success) => [actions.saveImage.success(request)],
      error: (request, error) => [
        actions.saveImage.failure({
          error: Error('Image could not be saved'),
          resource: request,
        }),
      ],
    })

export const downloadPreviewImageEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  listenToActionStream(action$)
    .andPerformAction(actions.downloadPreviewImage)
    .byAsynchronouslyExecuting(download)
    .withGroupId(requestData => `${requestData._id}-downloadPreviewImage`)
    .andJobs(requestData => [
      {
        queue: Queue.Download,
        payload: imagePreviewUploadPath(requestData._id),
      },
    ])
    .andResultCallbacks({
      success: (request, success) => [
        actions.downloadPreviewImage.success({
          image: request,
          fileContent: success.fileContent,
        }),
      ],
      error: (request, error) => [
        actions.downloadPreviewImage.failure({
          error: Error('Image could not be downloaded'),
          resource: request,
        }),
      ],
    })
