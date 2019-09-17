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
import { MAX_CONCURRENT_UPLOADS } from 'constants/index'
import { UploadData } from './types'

export const dequeueUploadEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions._dequeueUpload)),
    withLatestFrom(state$),
    filter(
      ([_action, state]) =>
        state.network.numberOfActiveUploads < MAX_CONCURRENT_UPLOADS,
    ),
    mergeMap(([_action, state]) => {
      const { uploadQueue, numberOfActiveUploads } = state.network

      const resultActions: RootAction[] = []

      uploadQueue
        .slice(0, MAX_CONCURRENT_UPLOADS - numberOfActiveUploads)
        .forEach(uploadData => {
          resultActions.push(actions._performUpload(uploadData))
        })

      return of(...resultActions)
    }),
  )

export const performUploadEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'files'>
> = (action$, state$, { files }) =>
  action$.pipe(
    filter(isActionOf(actions._performUpload)),
    mergeMap(action =>
      files.upload(action.payload.path, action.payload.payload).pipe(
        map(username =>
          actions.upload.success({
            ...action.payload,
            uploader: username,
          }),
        ),
        catchError(error =>
          of(actions.upload.failure({ error, resource: action.payload })),
        ),
        takeUntil(
          action$.pipe(
            filter(cancelAction => {
              return (
                isActionOf(actions.upload.cancel)(cancelAction) &&
                cancelAction.payload === action.payload.id
              )
            }),
          ),
        ),
      ),
    ),
  )

export const uploadEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.upload.request)),
    mergeMap(action => {
      return of(actions._enqueueUpload(action.payload))
    }),
  )
