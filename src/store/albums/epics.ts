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

export const refreshAlbumsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.refreshAlbums.request)),
    mergeMap(() =>
      albums.refreshAlbums().pipe(
        map(actions.refreshAlbums.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.refreshAlbums.cancel))),
        ),
        catchError(error =>
          of(actions.refreshAlbums.failure({ error, resource: null })),
        ),
      ),
    ),
  )

export const reloadAlbumsEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.refreshAlbums.success)),
    map(actions.getAlbums.request),
  )

export const getAlbumsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.getAlbums.request)),
    mergeMap(() =>
      albums.getAlbums().pipe(
        map(actions.getAlbums.success),
        takeUntil(action$.pipe(filter(isActionOf(actions.getAlbums.cancel)))),
        catchError(error =>
          of(actions.getAlbums.failure({ error, resource: null })),
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

export const refreshAlbumMetaEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'db' | 'files'>
> = (action$, state$, { db, files }) =>
  action$.pipe(
    filter(isActionOf(actions.refreshAlbums.request)),
    tap(() => db.albumMetas.load(files.download)),
    ignoreElements(),
  )

export const persistAlbumMetaEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'db' | 'files'>
> = (action$, state$, { db, files }) =>
  action$.pipe(
    filter(isActionOf(actions.setAlbumPosition.success)),
    tap(() => db.albumMetas.save(files.upload)),
    ignoreElements(),
  )
