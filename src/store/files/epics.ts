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

export const readFileEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.readFile.request)),
    mergeMap(action =>
      files.read(action.payload.data).pipe(
        map(fileHandleWithData =>
          actions.readFile.success({
            jobId: action.payload.jobId,
            data: fileHandleWithData,
          }),
        ),
        catchError(error =>
          of(
            actions.readFile.failure({
              jobId: action.payload.jobId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(cancelAction => {
              return (
                isActionOf(actions.readFile.cancel)(cancelAction) &&
                cancelAction.payload.jobId === action.payload.jobId
              )
            }),
          ),
        ),
      ),
    ),
  )
