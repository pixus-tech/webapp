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

export const getNotificationsEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'notifications'>
> = (action$, state$, { notifications }) =>
  action$.pipe(
    filter(isActionOf(actions.getNotifications.request)),
    mergeMap(() =>
      notifications.getNotifications().pipe(
        map(notifications =>
          actions.getNotifications.success({ notifications }),
        ),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.getNotifications.cancel))),
        ),
        catchError(error =>
          of(actions.getNotifications.failure({ error, resource: undefined })),
        ),
      ),
    ),
  )
