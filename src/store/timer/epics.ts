import { Epic } from 'redux-observable'
import { interval, of } from 'rxjs'
import {
  catchError,
  filter,
  mergeMap,
  map,
  takeUntil,
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
import { _dequeueUpload } from '../network/actions'
import { _dequeueReadFile } from '../files/actions'

export const dequeueUploadTimerEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.startTimer)),
    mergeMap(action =>
      interval(action.payload).pipe(
        withLatestFrom(state$),
        filter(([_, state]) => state.network.uploadQueue.size > 0),
        map(() => _dequeueUpload()),
        takeUntil(action$.pipe(filter(isActionOf(actions.stopTimer)))),
      ),
    ),
  )

export const dequeueReadFileTimerEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(actions.startTimer)),
    mergeMap(action =>
      interval(action.payload).pipe(
        withLatestFrom(state$),
        filter(([_, state]) => state.files.fileQueue.size > 0),
        map(() => _dequeueReadFile()),
        takeUntil(action$.pipe(filter(isActionOf(actions.stopTimer)))),
      ),
    ),
  )
