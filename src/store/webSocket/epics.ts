import { Epic } from 'redux-observable'
import { filter, mergeMap, map, tap, ignoreElements } from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'
import { upsertAlbum } from 'store/albums/actions'

export const subscribeWebSocketEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.subscribeWebSocket)),
    mergeMap(action => albums.subscribe().pipe(map(upsertAlbum))),
  )

export const unsubscribeWebSocketEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'albums'>
> = (action$, state$, { albums }) =>
  action$.pipe(
    filter(isActionOf(actions.unsubscribeWebSocket)),
    map(action => action),
    tap(() => albums.unsubscribe()),
    ignoreElements(),
  )
