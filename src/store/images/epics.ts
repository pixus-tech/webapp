import _ from 'lodash'
import { Epic } from 'redux-observable'
import { of, race, merge } from 'rxjs'
import {
  catchError,
  filter,
  map,
  mergeMap,
  takeUntil,
  take,
  withLatestFrom,
  tap,
  ignoreElements,
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
import { imagePreviewPath, imagePath } from 'models/image'

export const getImagesEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.getImages)),
    mergeMap(({ payload }) =>
      of(
        actions.getImagesFromCache.request(payload),
        actions.refreshImagesCache.request(payload),
      ),
    ),
  )

export const refreshImagesCacheEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.refreshImagesCache.request)),
    filter(({ payload }) => payload.attributes.userGroupId !== undefined),
    mergeMap(({ payload }) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      images.refreshImages(payload.attributes.userGroupId!).pipe(
        map(images => actions.refreshImagesCache.success(payload)),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.refreshImagesCache.cancel)),
            filter(cancel => _.isEqual(cancel.payload, payload)),
          ),
        ),
        catchError(error =>
          of(actions.refreshImagesCache.failure({ error, resource: payload })),
        ),
      ),
    ),
  )

export const reloadImagesEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.refreshImagesCache.success)),
    map(({ payload }) => actions.getImagesFromCache.request(payload)),
  )

export const getImagesFromCacheEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.getImagesFromCache.request)),
    mergeMap(({ payload }) =>
      images.getImagesFromCache(payload.attributes).pipe(
        map(images =>
          actions.getImagesFromCache.success({ filter: payload, images }),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.getImagesFromCache.cancel)),
            filter(cancel => _.isEqual(cancel.payload, payload)),
          ),
        ),
        catchError(error =>
          of(actions.getImagesFromCache.failure({ error, resource: payload })),
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

export const requestDownloadPreviewImageEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.requestDownloadPreviewImage)),
    withLatestFrom(state$),
    filter(([action, state]) => {
      const imageId = action.payload.image._id
      return (
        !state.images.previewImageIsLoadingMap.get(imageId) &&
        !state.images.previewImageObjectURLMap.get(imageId)
      )
    }),
    map(([action]) => actions.downloadPreviewImage.request(action.payload)),
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
        .download(imagePreviewPath(image), image.username, album.privateKey)
        .pipe(
          map(fileContent =>
            actions.downloadPreviewImage.success({ image, fileContent }),
          ),
          takeUntil(
            action$.pipe(
              filter(isActionOf(actions.downloadPreviewImage.cancel)),
              filter(
                ({ payload }) =>
                  payload.album._id === album._id &&
                  payload.image._id === image._id,
              ),
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

export const requestDownloadImageEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.requestDownloadImage)),
    withLatestFrom(state$),
    filter(([action, state]) => {
      const imageId = action.payload.image._id
      return (
        !state.images.imageIsLoadingMap.get(imageId) &&
        !state.images.imageObjectURLMap.get(imageId)
      )
    }),
    map(([action]) => actions.downloadImage.request(action.payload)),
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
        .download(imagePath(image), image.username, album.privateKey)
        .pipe(
          map(fileContent =>
            actions.downloadImage.success({ image, fileContent }),
          ),
          takeUntil(
            action$.pipe(
              filter(isActionOf(actions.downloadImage.cancel)),
              filter(
                ({ payload }) =>
                  payload.album._id === album._id &&
                  payload.image._id === image._id,
              ),
            ),
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

export const saveImageEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.saveImage.request)),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { album, image } = action.payload

      const objectURL = state.images.imageObjectURLMap.get(image._id)
      if (objectURL !== undefined) {
        return of(actions.saveImage.success({ image, objectURL }))
      }

      return merge(
        of(actions.requestDownloadImage(action.payload)),
        race(
          action$.pipe(
            filter(isActionOf(actions.saveImage.cancel)),
            filter(
              ({ payload }) =>
                payload.album._id === album._id &&
                payload.image._id === image._id,
            ),
            take(1),
            map(({ payload }) => actions.downloadImage.cancel(payload)),
          ),
          action$.pipe(
            filter(isActionOf(actions.downloadImage.failure)),
            filter(({ payload }) => payload.resource._id === image._id),
            take(1),
            map(({ payload: { error, resource } }) =>
              actions.saveImage.failure({ error, resource }),
            ),
          ),
          action$.pipe(
            filter(isActionOf(actions.downloadImage.success)),
            filter(({ payload }) => payload.image._id === image._id),
            withLatestFrom(state$),
            take(1),
            map(([{ payload: { image } }, state]) => {
              const objectURL = state.images.imageObjectURLMap.get(image._id)
              if (objectURL !== undefined) {
                return actions.saveImage.success({ image, objectURL })
              }

              return actions.saveImage.failure({
                resource: image,
                error: Error('Image was not properly downloaded.'),
              })
            }),
          ),
        ),
      )
    }),
  )

export const saveImageFileEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.saveImage.success)),
    tap(({ payload }) => {
      files.save(payload.image, payload.objectURL)
    }),
    ignoreElements(),
  )

export const getEXIFTagsAfterUploadEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.didProcessImage)),
    filter(({ payload }) => images.shouldScanEXIFTags(payload.image)),
    map(({ payload }) =>
      actions.updateImageEXIFTags.request({
        image: payload.image,
        imageData: payload.imageData,
      }),
    ),
  )

export const getEXIFTagsAfterDownloadEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.downloadImage.success)),
    filter(({ payload }) => images.shouldScanEXIFTags(payload.image)),
    map(({ payload }) => {
      let imageData: ArrayBuffer

      if (typeof payload.fileContent !== 'string') {
        imageData = payload.fileContent.buffer
      } else {
        return actions.updateImageEXIFTags.failure({
          error: Error('String could not be converted to ArrayBuffer'),
          resource: payload.image,
        })
      }

      return actions.updateImageEXIFTags.request({
        image: payload.image,
        imageData,
      })
    }),
  )

export const updateEXIFTagsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.updateImageEXIFTags.request)),
    mergeMap(({ payload: { image, imageData } }) => {
      // TODO: Type exif tags
      const exifTags = images.getEXIFTags(imageData)
      // TODO: Also update current exif index
      return images.updateMeta(image, { exifTags }).pipe(
        map(({ resource }) => actions.updateImageEXIFTags.success(resource)),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.updateImageEXIFTags.cancel)),
            filter(cancel => cancel.payload._id === image._id),
          ),
        ),
        catchError(error =>
          of(
            actions.updateImageEXIFTags.failure({
              error,
              resource: image,
            }),
          ),
        ),
      )
    }),
  )
