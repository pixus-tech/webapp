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
