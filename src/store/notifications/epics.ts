import _ from 'lodash'
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

export const getNotificationsEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.getNotifications)),
    mergeMap(({ payload }) =>
      of(
        actions.getNotificationsFromCache.request(payload),
        actions.refreshNotificationsCache.request(payload),
      ),
    ),
  )

export const refreshNotificationsCacheEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'notifications'>
> = (action$, state$, { notifications }) =>
  action$.pipe(
    filter(isActionOf(actions.refreshNotificationsCache.request)),
    mergeMap(({ payload }) =>
      notifications.refreshNotifications().pipe(
        map(() => actions.refreshNotificationsCache.success(payload)),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.refreshNotificationsCache.cancel)),
            filter(cancel => _.isEqual(cancel.payload, payload)),
          ),
        ),
        catchError(error =>
          of(
            actions.refreshNotificationsCache.failure({
              error,
              resource: payload,
            }),
          ),
        ),
      ),
    ),
  )

export const reloadNotificationsEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.refreshNotificationsCache.success)),
    map(({ payload }) => actions.getNotificationsFromCache.request(payload)),
  )

export const getNotificationsFromCacheEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'notifications'>
> = (action$, state$, { notifications }) =>
  action$.pipe(
    filter(isActionOf(actions.getNotificationsFromCache.request)),
    mergeMap(({ payload }) =>
      notifications.getNotificationsFromCache(payload.filter).pipe(
        map(notifications =>
          actions.getNotificationsFromCache.success({
            filter: payload,
            notifications,
          }),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.getNotificationsFromCache.cancel)),
            filter(cancel => _.isEqual(cancel.payload, payload)),
          ),
        ),
        catchError(error =>
          of(
            actions.getNotificationsFromCache.failure({
              error,
              resource: payload,
            }),
          ),
        ),
      ),
    ),
  )

export const setNotificationRead: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'notifications'>
> = (action$, state$, { notifications }) =>
  action$.pipe(
    filter(isActionOf(actions.setNotificationRead.request)),
    mergeMap(({ payload }) =>
      notifications.setNotificationRead(payload).pipe(
        map(actions.setNotificationRead.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.setNotificationRead.cancel)),
            filter(cancel => cancel.payload._id === payload._id),
          ),
        ),
        catchError(error =>
          of(actions.setNotificationRead.failure({ error, resource: payload })),
        ),
      ),
    ),
  )
