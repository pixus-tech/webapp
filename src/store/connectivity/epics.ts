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
  _state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.probeConnectivity)),
    mergeMap(() =>
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
    mergeMap(() =>
      connectivity.isBlockstackReachable().pipe(
        map(actions.probeBlockstackConnectivity.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.probeBlockstackConnectivity.cancel)),
          ),
        ),
        catchError(() => of(actions.probeBlockstackConnectivity.failure())),
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
    mergeMap(() =>
      connectivity.isHubReachable().pipe(
        map(actions.probeHubConnectivity.success),
        takeUntil(
          action$.pipe(filter(isActionOf(actions.probeHubConnectivity.cancel))),
        ),
        catchError(() => of(actions.probeHubConnectivity.failure())),
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
    mergeMap(() =>
      connectivity.isRadiksReachable().pipe(
        map(actions.probeRadiksConnectivity.success),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.probeRadiksConnectivity.cancel)),
          ),
        ),
        catchError(() => of(actions.probeRadiksConnectivity.failure())),
      ),
    ),
  )
