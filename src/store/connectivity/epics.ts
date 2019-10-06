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

export const probeConnectivityEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.probeConnectivity)),
    mergeMap(action =>
      of(
        actions.probeBlockstackConnectivity.request(),
        actions.probeHubConnectivity.request(),
        actions.probeRadiksConnectivity.request(),
      ),
    ),
  )

export const probeBlockstackConnectivityEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'connectivity'>
> = (action$, state$, { connectivity }) =>
  action$.pipe(
    filter(isActionOf(actions.probeBlockstackConnectivity.request)),
    mergeMap(action =>
      connectivity.isBlockstackReachable().pipe(
        map(actions.probeBlockstackConnectivity.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.probeBlockstackConnectivity.cancel)),
          ),
        ),
        catchError(error => of(actions.probeBlockstackConnectivity.failure())),
      ),
    ),
  )

export const probeHubConnectivityEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'connectivity'>
> = (action$, state$, { connectivity }) =>
  action$.pipe(
    filter(isActionOf(actions.probeHubConnectivity.request)),
    mergeMap(action =>
      connectivity.isHubReachable().pipe(
        map(actions.probeHubConnectivity.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.probeHubConnectivity.cancel))),
        ),
        catchError(error => of(actions.probeHubConnectivity.failure())),
      ),
    ),
  )

export const probeRadiksConnectivityEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'connectivity'>
> = (action$, state$, { connectivity }) =>
  action$.pipe(
    filter(isActionOf(actions.probeRadiksConnectivity.request)),
    mergeMap(action =>
      connectivity.isRadiksReachable().pipe(
        map(actions.probeRadiksConnectivity.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.probeRadiksConnectivity.cancel)),
          ),
        ),
        catchError(error => of(actions.probeRadiksConnectivity.failure())),
      ),
    ),
  )
