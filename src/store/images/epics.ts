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
import { FileHandle } from 'models/fileHandle'
import { imagePreviewPath, imagePath } from 'models/image'

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
> = (action$, _state$) =>
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

export const uploadImageToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageToAlbum.request)),
    mergeMap(action => {
      const { album, fileHandle } = action.payload
      return images.uploadImageToAlbum(album, fileHandle).pipe(
        map(image => actions.uploadImageToAlbum.success({ album, image })),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.uploadImageToAlbum.cancel))), // TODO: should respect filehandle id
        ),
        catchError(error =>
          of(
            actions.uploadImageToAlbum.failure({
              error,
              resource: { album, fileHandle },
            }),
          ),
        ),
      )
    }),
  )

export const deleteImageEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.deleteImage.request)),
    mergeMap(action =>
      images.delete(action.payload).pipe(
        map(_image => actions.deleteImage.success(action.payload)),
        takeUntil(action$.pipe(filter(isActionOf(actions.deleteImage.cancel)))),
        catchError(error =>
          of(
            actions.deleteImage.failure({
              error,
              resource: action.payload,
            }),
          ),
        ),
      ),
    ),
  )

export const downloadPreviewImageEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.downloadPreviewImage.request)),
    mergeMap(action => {
      const { album, image } = action.payload
      return files
        .download(imagePreviewPath(image._id), image.username, album.privateKey)
        .pipe(
          map(fileContent =>
            actions.downloadPreviewImage.success({ image, fileContent }),
          ),
          takeUntil(
            action$.pipe(
              filter(isActionOf(actions.downloadPreviewImage.cancel)),
            ),
          ),
          catchError(error =>
            of(
              actions.downloadPreviewImage.failure({
                error,
                resource: image,
                showToast: true,
              }),
            ),
          ),
        )
    }),
  )

export const downloadImageEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.downloadImage.request)),
    mergeMap(action => {
      const { album, image } = action.payload
      return files
        .download(imagePath(image._id), image.username, album.privateKey)
        .pipe(
          map(fileContent =>
            actions.downloadImage.success({ image, fileContent }),
          ),
          takeUntil(
            action$.pipe(filter(isActionOf(actions.downloadImage.cancel))),
          ),
          catchError(error =>
            of(
              actions.downloadImage.failure({
                error,
                resource: image,
                showToast: true,
              }),
            ),
          ),
        )
    }),
  )
