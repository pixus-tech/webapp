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
import { saveRecord } from 'store/network/actions'
import { AlbumRecordFactory } from 'db/album'
import { Queue } from 'store/queue/types'
import { listenToActionStream } from 'utils/queue'

export const fetchAlbumTreeEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.getAlbums.request)),
    mergeMap(action =>
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
      albums.addAlbum(action.payload).pipe(
        mergeMap(response => of(actions.addAlbum.success(response))),
        takeUntil(action$.pipe(filter(isActionOf(actions.addAlbum.cancel)))),
        catchError(error =>
          of(actions.addAlbum.failure({ error, resource: action.payload })),
        ),
      ),
    ),
  )

export const saveAlbumEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  listenToActionStream(action$, state$)
    .andPerformAction(actions.saveAlbum)
    .byAsynchronouslyExecuting(saveRecord)
    .withGroupId(requestData => `${requestData._id}-saveAlbum`)
    .andJobs(requestData => [
      {
        queue: Queue.RecordOperation,
        payload: AlbumRecordFactory.build(requestData),
      },
    ])
    .andResultCallbacks({
      success: (request, success) => [actions.saveAlbum.success(request)],
      error: (request, error) => [
        actions.saveAlbum.failure({
          error: Error('Album could not be saved'),
          resource: request,
        }),
      ],
    })

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
