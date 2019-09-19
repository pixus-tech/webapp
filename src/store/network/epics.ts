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
import { UploadData } from './types'

export const uploadEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.upload.request)),
    mergeMap(action =>
      files.upload(action.payload.data.path, action.payload.data.payload).pipe(
        map(username =>
          actions.upload.success({
            jobId: action.payload.jobId,
            data: {
              ...action.payload.data,
              uploader: username,
            },
          }),
        ),
        catchError(error =>
          of(
            actions.upload.failure({
              jobId: action.payload.jobId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(cancelAction => {
              return (
                isActionOf(actions.upload.cancel)(cancelAction) &&
                cancelAction.payload.jobId === action.payload.jobId
              )
            }),
          ),
        ),
      ),
    ),
  )
