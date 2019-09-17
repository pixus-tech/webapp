import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import {
  catchError,
  filter,
  map,
  mergeMap,
  withLatestFrom,
  ignoreElements,
  takeUntil,
} from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'
import { MAX_CONCURRENT_FILE_READS } from 'constants/index'
import { FileHandle, FileHandleWithData } from 'models/fileHandle'

export const dequeueReadFileEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions._dequeueReadFile)),
    withLatestFrom(state$),
    filter(
      ([_action, state]) =>
        state.files.numberOfActiveFileReads < MAX_CONCURRENT_FILE_READS,
    ),
    mergeMap(([_action, state]) => {
      const { fileQueue, numberOfActiveFileReads } = state.files

      const resultActions: RootAction[] = []

      fileQueue
        .slice(0, MAX_CONCURRENT_FILE_READS - numberOfActiveFileReads)
        .forEach(fileHandle => {
          resultActions.push(actions._performReadFile(fileHandle))
        })

      return of(...resultActions)
    }),
  )

export const performReadFileEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions._performReadFile)),
    mergeMap(action =>
      files.read(action.payload).pipe(
        map(actions.readFile.success),
        catchError(error =>
          of(actions.readFile.failure({ error, resource: action.payload })),
        ),
        takeUntil(
          action$.pipe(
            filter(cancelAction => {
              return (
                isActionOf(actions.readFile.cancel)(cancelAction) &&
                cancelAction.payload === action.payload._id
              )
            }),
          ),
        ),
      ),
    ),
  )

export const readFileEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.readFile.request)),
    mergeMap(action => {
      return of(actions._enqueueReadFile(action.payload))
    }),
  )
