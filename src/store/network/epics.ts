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
            groupId: action.payload.groupId,
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
              groupId: action.payload.groupId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.upload.cancel)),
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

export const downloadEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions.download.request)),
    mergeMap(action =>
      files.download(action.payload.data).pipe(
        map(data =>
          actions.download.success({
            jobId: action.payload.jobId,
            groupId: action.payload.groupId,
            data: {
              path: action.payload.data,
              fileContent: data,
            },
          }),
        ),
        catchError(error =>
          of(
            actions.download.failure({
              jobId: action.payload.jobId,
              groupId: action.payload.groupId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.download.cancel)),
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

export const saveRecordEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'records'>
> = (action$, state$, { records }) =>
  action$.pipe(
    filter(isActionOf(actions.saveRecord.request)),
    mergeMap(action =>
      records.saveRecord(action.payload.data).pipe(
        map(imageRecord => actions.saveRecord.success(action.payload)),
        catchError(error =>
          of(
            actions.saveRecord.failure({
              jobId: action.payload.jobId,
              groupId: action.payload.groupId,
              data: { error, resource: action.payload.data },
            }),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.saveRecord.cancel)),
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
