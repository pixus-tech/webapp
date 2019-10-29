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
import { toggleBooleanNumber } from 'utils/db'
import Analytics from 'utils/analytics'

const albumMissingError = Error('Album of image was not present.')

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
    filter(({ payload }) => payload.filter.name === 'album'),
    mergeMap(({ payload }) => {
      const userGroupId = payload.filter.data

      if (typeof userGroupId !== 'string') {
        return of(
          actions.refreshImagesCache.failure({
            error: Error('UserGroupId was missing from resource filter.'),
            resource: payload,
          }),
        )
      }

      return images.refreshImages(userGroupId).pipe(
        map(() => actions.refreshImagesCache.success(payload)),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.refreshImagesCache.cancel)),
            filter(cancel => _.isEqual(cancel.payload, payload)),
          ),
        ),
        catchError(error =>
          of(actions.refreshImagesCache.failure({ error, resource: payload })),
        ),
      )
    }),
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
      images.getImagesFromCache(payload.filter).pipe(
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

export const resumePendingUploadsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.resumePendingUploads)),
    mergeMap(() =>
      images
        .getImagesFromCache({ name: 'pending-uploads' })
        .pipe(
          mergeMap(images =>
            of(...images.map(image => actions.requestUploadImage(image))),
          ),
        ),
    ),
  )

export const addImagesToAlbumEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  _state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.addImagesToAlbum)),
    tap(action =>
      Analytics.track('uploadImages', action.payload.imageFiles.length),
    ),
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

          return actions.addImageToAlbum.request({ album, fileHandle })
        },
      )

      return of(...resultActions)
    }),
  )

export const addImageToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.addImageToAlbum.request)),
    mergeMap(({ payload }) => {
      const { album, fileHandle } = payload
      return images.addImageToAlbum(album, fileHandle).pipe(
        map(image => actions.addImageToAlbum.success({ album, image })),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.addImageToAlbum.cancel)),
            filter(cancel => cancel.payload.fileHandle._id === fileHandle._id),
          ),
        ),
        catchError(error =>
          of(
            actions.addImageToAlbum.failure({
              error,
              resource: { album, fileHandle },
            }),
          ),
        ),
      )
    }),
  )

export const uploadImageAfterAddingItToAlbumEpic: Epic<
  RootAction,
  RootAction
> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.addImageToAlbum.success)),
    map(({ payload }) => actions.uploadImageToAlbum.request(payload)),
  )

export const requestUploadImageEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.requestUploadImage)),
    withLatestFrom(state$),
    map(([action, state]) => {
      const image = action.payload
      const album = state.albums.data.get(image.userGroupId)

      if (album === undefined) {
        return actions.requestUploadImageFailure(image)
      }

      return actions.uploadImageToAlbum.request({ image, album })
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
    filter(({ payload }) => images.shouldUpload(payload.image)),
    mergeMap(({ payload }) => {
      const { album, image } = payload
      return images.uploadImageToAlbum(image, album).pipe(
        map(() => actions.uploadImageToAlbum.success(payload)),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.uploadImageToAlbum.cancel)),
            filter(cancel => cancel.payload._id === image._id),
          ),
        ),
        catchError(error =>
          of(
            actions.uploadImageToAlbum.failure({
              error,
              resource: payload,
            }),
          ),
        ),
      )
    }),
  )

export const propagateUploadSuccessEpic: Epic<
  RootAction,
  RootAction
> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.uploadImageToAlbum.success)),
    map(({ payload: { image } }) => {
      const updates = {
        isOnRadiks: 1,
        isImageStored: 1,
        isPreviewImageStored: 1,
      }
      return actions.updateImageMeta.request({ image, updates })
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
    tap(() => Analytics.track('deleteImage')),
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
      const imageId = action.payload._id
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
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.downloadPreviewImage.request)),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const image = action.payload
      const album = state.albums.data.get(image.userGroupId)

      if (album === undefined) {
        return of(
          actions.downloadPreviewImage.failure({
            error: albumMissingError,
            resource: image,
            showToast: true,
          }),
        )
      }

      return images.download(image, album, 'preview').pipe(
        map(objectURL =>
          actions.downloadPreviewImage.success({ image, objectURL }),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.downloadPreviewImage.cancel)),
            filter(cancel => cancel.payload._id === image._id),
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
      const imageId = action.payload._id
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
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.downloadImage.request)),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const image = action.payload
      const album = state.albums.data.get(image.userGroupId)

      if (album === undefined) {
        return of(
          actions.downloadImage.failure({
            error: albumMissingError,
            resource: image,
            showToast: true,
          }),
        )
      }

      return images.download(image, album, 'full').pipe(
        map(objectURL => actions.downloadImage.success({ image, objectURL })),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.downloadImage.cancel)),
            filter(cancel => cancel.payload._id === image._id),
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
    tap(() => Analytics.track('saveImage')),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const image = action.payload
      const album = state.albums.data.get(image.userGroupId)

      if (album === undefined) {
        return of(
          actions.saveImage.failure({
            error: albumMissingError,
            resource: image,
          }),
        )
      }

      const objectURL = state.images.imageObjectURLMap.get(image._id)
      if (objectURL !== undefined) {
        return of(actions.saveImage.success({ image, objectURL }))
      }

      return merge(
        of(actions.requestDownloadImage(action.payload)),
        race(
          action$.pipe(
            filter(isActionOf(actions.saveImage.cancel)),
            filter(cancel => cancel.payload._id === image._id),
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

/*
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
      const imageData: ArrayBuffer = new ArrayBuffer(0)

      // TODO: Use objecturl for exif scan
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
*/

export const toggleImageFavoriteEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.toggleImageFavorite)),
    map(({ payload: image }) => {
      const updates = { isFavorite: toggleBooleanNumber(image.meta.isFavorite) }
      return actions.updateImageMeta.request({ image, updates })
    }),
  )

export const updateImageMetaEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'images'>
> = (action$, state$, { images }) =>
  action$.pipe(
    filter(isActionOf(actions.updateImageMeta.request)),
    mergeMap(({ payload: { image, updates } }) =>
      images.updateMeta(image, updates).pipe(
        map(actions.updateImageMeta.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.updateImageMeta.cancel)),
            filter(cancel => cancel.payload._id === image._id),
          ),
        ),
        catchError(error =>
          of(
            actions.updateImageMeta.failure({
              error,
              resource: { image, updates },
            }),
          ),
        ),
      ),
    ),
  )
