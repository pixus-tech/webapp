import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import { catchError, filter, map, mergeMap, takeUntil } from 'rxjs/operators'
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
            groupId: action.payload.groupId,
            jobId: action.payload.jobId,
            data: fileHandleWithData,
          }),
        ),
        catchError(error =>
          of(
            actions.readFile.failure({
              groupId: action.payload.groupId,
              jobId: action.payload.jobId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.readFile.cancel)),
            filter(
              cancelAction =>
                cancelAction.payload.groupId === action.payload.groupId ||
                cancelAction.payload.jobId === action.payload.jobId,
            ),
          ),
        ),
      ),
    ),
  )