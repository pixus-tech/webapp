import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import {
  catchError,
  filter,
  ignoreElements,
  map,
  mergeMap,
  takeUntil,
  tap,
} from 'rxjs/operators'
import {
  ActionType,
  RootAction,
  RootService,
  RootState,
  isActionOf,
} from 'typesafe-actions'

import * as actions from './actions'
import Analytics from 'utils/analytics'

export const saveSettingsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'settings'>
> = (action$, state$, { settings }) =>
  action$.pipe(
    filter(isActionOf(actions.saveSettings.request)),
    tap(() => Analytics.track('saveSettings')),
    mergeMap(action =>
      settings.save(action.payload).pipe(
        map(settings => actions.saveSettings.success(settings)),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.saveSettings.cancel))),
        ),
        catchError(error =>
          of(actions.saveSettings.failure({ error, resource: action.payload })),
        ),
      ),
    ),
  )

export const loadSettingsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'settings'>
> = (action$, state$, { settings }) =>
  action$.pipe(
    filter(isActionOf(actions.loadSettings.request)),
    mergeMap(() =>
      settings.load().pipe(
        map(settings => actions.loadSettings.success(settings)),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.loadSettings.cancel))),
        ),
        catchError(error =>
          of(actions.loadSettings.failure({ error, resource: undefined })),
        ),
      ),
    ),
  )

export const setSettingsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'dispatcher' | 'files'>
> = (action$, state$, { dispatcher, files }) =>
  action$.pipe(
    filter(
      action =>
        isActionOf(actions.loadSettings.success)(action) ||
        isActionOf(actions.saveSettings.request)(action),
    ),
    tap(action => {
      const { payload: settings } = action as
        | ActionType<typeof actions.loadSettings.success>
        | ActionType<typeof actions.saveSettings.request>
      dispatcher.configure(settings)
      files.configure(settings)
    }),
    ignoreElements(),
  )
