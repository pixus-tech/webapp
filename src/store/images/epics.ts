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
import { FileHandle } from 'models/fileHandle'

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

export const saveImageEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.saveImage.request)),
    mergeMap(action =>
      images.saveImage(action.payload.data).pipe(
        map(imageRecord =>
          actions.saveImage.success({
            jobId: action.payload.jobId,
            data: action.payload.data,
          }),
        ),
        catchError(error =>
          of(
            actions.saveImage.failure({
              jobId: action.payload.jobId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(cancelAction => {
              return (
                isActionOf(actions.saveImage.cancel)(cancelAction) &&
                cancelAction.payload.jobId === action.payload.jobId
              )
            }),
          ),
        ),
      ),
    ),
  )
