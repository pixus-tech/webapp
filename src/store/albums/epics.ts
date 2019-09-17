import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import { catchError, filter, mergeMap, map, takeUntil } from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'

export const fetchAlbumTreeEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.getAlbumTree.request)),
    mergeMap(action =>
      albums.getAlbumTree().pipe(
        map(actions.getAlbumTree.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.getAlbumTree.cancel))),
        ),
        catchError(error =>
          of(actions.getAlbumTree.failure({ error, resource: null })),
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
      albums.addAlbum(action.payload).pipe(
        mergeMap(response => of(actions.addAlbum.success(response))),
        takeUntil(action$.pipe(filter(isActionOf(actions.addAlbum.cancel)))),
        catchError(error =>
          of(actions.addAlbum.failure({ error, resource: action.payload })),
        ),
      ),
    ),
  )

export const setParentAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.setParentAlbum.request)),
    mergeMap(({ payload: { album, parentAlbum } }) =>
      albums.updateAlbum(album, { parentAlbumId: parentAlbum._id }).pipe(
        mergeMap(response => of(actions.setParentAlbum.success(response))),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.setParentAlbum.cancel))),
        ),
        catchError(error =>
          of(
            actions.setParentAlbum.failure({
              error,
              resource: { album, parentAlbum },
            }),
          ),
        ),
      ),
    ),
  )
