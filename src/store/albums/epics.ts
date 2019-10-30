import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import {
  catchError,
  filter,
  mergeMap,
  map,
  takeUntil,
  tap,
  ignoreElements,
  withLatestFrom,
} from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'
import { redirect, buildAlbumRoute } from 'utils/routes'
import positionBeforeIndex from 'utils/listIndex'
import Analytics from 'utils/analytics'

export const getAlbumsEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.getAlbums)),
    mergeMap(() =>
      of(
        actions.getAlbumsFromCache.request(),
        actions.refreshAlbumsCache.request(),
      ),
    ),
  )

export const refreshAlbumsCacheEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.refreshAlbumsCache.request)),
    mergeMap(() =>
      albums.refreshAlbums().pipe(
        map(actions.refreshAlbumsCache.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.refreshAlbumsCache.cancel))),
        ),
        catchError(error =>
          of(
            actions.refreshAlbumsCache.failure({ error, resource: undefined }),
          ),
        ),
      ),
    ),
  )

export const reloadAlbumsEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.refreshAlbumsCache.success)),
    map(actions.getAlbumsFromCache.request),
  )

export const getAlbumsFromCacheEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.getAlbumsFromCache.request)),
    mergeMap(() =>
      albums.getAlbumsFromCache().pipe(
        map(actions.getAlbumsFromCache.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.getAlbumsFromCache.cancel))),
        ),
        catchError(error =>
          of(
            actions.getAlbumsFromCache.failure({ error, resource: undefined }),
          ),
        ),
      ),
    ),
  )

export const addAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.addAlbum.request)),
    tap(action => {
      if (action.payload.isDirectory) {
        Analytics.track('createDirectory')
      } else {
        Analytics.track('createAlbum')
      }
    }),
    mergeMap(action =>
      albums.addAlbum(action.payload.isDirectory).pipe(
        mergeMap(response => of(actions.addAlbum.success(response))),
        takeUntil(action$.pipe(filter(isActionOf(actions.addAlbum.cancel)))),
        catchError(error =>
          of(actions.addAlbum.failure({ error, resource: undefined })),
        ),
      ),
    ),
  )

export const redirectToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.addAlbum.success)),
    tap(action => redirect(buildAlbumRoute(action.payload.resource))),
    ignoreElements(),
  )

export const saveAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.saveAlbum.request)),
    mergeMap(action =>
      albums.save(action.payload).pipe(
        mergeMap(() => of(actions.saveAlbum.success(action.payload))),
        takeUntil(action$.pipe(filter(isActionOf(actions.saveAlbum.cancel)))), // TODO: respect cancel id
        catchError(error =>
          of(actions.saveAlbum.failure({ error, resource: action.payload })),
        ),
      ),
    ),
  )

export const requestSetAlbumPositionEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.requestSetAlbumPosition)),
    withLatestFrom(state$),
    map(([action, state]) => {
      const { album, successor } = action.payload
      const albumIndices = state.albums.data
        .toList()
        .map(a => a.meta.index)
        .toArray()
      const position = positionBeforeIndex(
        albumIndices,
        album.meta.index,
        successor.meta.index,
      )
      // TODO: Implement reordering if `position` suggests it
      return actions.setAlbumPosition.request({
        album,
        parentId: successor.meta.parentId,
        index: position.index,
      })
    }),
  )

export const setAlbumPositionEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.setAlbumPosition.request)),
    tap(() => Analytics.track('arrangeAlbum')),
    mergeMap(({ payload: { album, parentId, index } }) =>
      albums.updateMeta(album, { index, parentId }).pipe(
        map(actions.setAlbumPosition.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.setAlbumPosition.cancel))),
        ),
        catchError(error =>
          of(
            actions.setAlbumPosition.failure({
              error,
              resource: { album, index, parentId },
            }),
          ),
        ),
      ),
    ),
  )

export const setAlbumImageColumnCountEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.setAlbumImageColumnCount.request)),
    tap(() => Analytics.track('setImageColumnCount')),
    mergeMap(({ payload: { album, numberOfImageColumns } }) =>
      albums.updateMeta(album, { numberOfImageColumns }).pipe(
        map(actions.setAlbumImageColumnCount.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.setAlbumImageColumnCount.cancel)),
          ),
        ),
        catchError(error =>
          of(
            actions.setAlbumImageColumnCount.failure({
              error,
              resource: { album, numberOfImageColumns },
            }),
          ),
        ),
      ),
    ),
  )
