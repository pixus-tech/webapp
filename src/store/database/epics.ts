import { Epic } from 'redux-observable'
import { of, race, merge } from 'rxjs'
import {
  catchError,
  ignoreElements,
  filter,
  map,
  tap,
  mergeMap,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'

export const loadDatabaseEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'db'>
> = (action$, state$, { db }) =>
  action$.pipe(
    filter(isActionOf(actions.loadDatabase.request)),
    mergeMap(() =>
      db.loadAll().pipe(
        map(({ albums, images }) =>
          actions.loadDatabase.success(albums && images),
        ),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.loadDatabase.cancel))),
        ),
        catchError(() => of(actions.loadDatabase.failure())),
      ),
    ),
  )

export const saveDatabaseEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'db'>
> = (action$, state$, { db }) =>
  action$.pipe(
    filter(isActionOf(actions.saveDatabase.request)),
    mergeMap(() =>
      db.saveAll().pipe(
        map(({ albums, images }) =>
          actions.saveDatabase.success(albums && images),
        ),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.saveDatabase.cancel))),
        ),
        catchError(() => of(actions.saveDatabase.failure())),
      ),
    ),
  )

export const resetDatabaseEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.resetDatabase.request)),
    mergeMap(() =>
      merge(
        of(actions.saveDatabase.request()),
        race(
          action$.pipe(
            filter(isActionOf(actions.saveDatabase.cancel)),
            withLatestFrom(state$),
            filter(([_action, state]) => state.database.isResetting),
            take(1),
            map(() => actions.resetDatabase.failure()),
          ),
          action$.pipe(
            filter(isActionOf(actions.saveDatabase.failure)),
            withLatestFrom(state$),
            filter(([_action, state]) => state.database.isResetting),
            take(1),
            map(() => actions.resetDatabase.failure()),
          ),
          action$.pipe(
            filter(isActionOf(actions.saveDatabase.success)),
            withLatestFrom(state$),
            filter(([_action, state]) => state.database.isResetting),
            filter(([{ payload: success }, _state]) => !success),
            take(1),
            map(() => actions.resetDatabase.failure()),
          ),
          action$.pipe(
            filter(isActionOf(actions.saveDatabase.success)),
            withLatestFrom(state$),
            filter(([_action, state]) => state.database.isResetting),
            filter(([{ payload: success }, _state]) => success),
            take(1),
            map(actions.wipeDatabase.request),
          ),
        ),
      ),
    ),
  )

export const wipeDatabaseEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'db'>
> = (action$, state$, { db }) =>
  action$.pipe(
    filter(isActionOf(actions.wipeDatabase.request)),
    mergeMap(() =>
      db.wipe().pipe(
        mergeMap(() =>
          of(actions.wipeDatabase.success(), actions.resetDatabase.success()),
        ),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.wipeDatabase.cancel))),
        ),
        catchError(() => of(actions.wipeDatabase.failure())),
      ),
    ),
  )

export const reloadAfterDBWipeEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.wipeDatabase.success)),
    tap(() => {
      setTimeout(() => window.location.reload(), 1000)
    }),
    ignoreElements(),
  )
