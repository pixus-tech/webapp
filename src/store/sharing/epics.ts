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

export const findUserEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'users'>
> = (action$, state$, { users }) =>
  action$.pipe(
    filter(isActionOf(actions.findUser.request)),
    mergeMap(action =>
      users.findUser(action.payload).pipe(
        map(user => actions.findUser.success(user)),
        takeUntil(action$.pipe(filter(isActionOf(actions.findUser.cancel)))),
        catchError(error =>
          of(actions.findUser.failure({ error, resource: action.payload })),
        ),
      ),
    ),
  )

export const inviteUserEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'users'>
> = (action$, state$, { users }) =>
  action$.pipe(
    filter(isActionOf(actions.inviteUser.request)),
    mergeMap(action =>
      users
        .inviteUserToAlbum(
          action.payload.user,
          action.payload.album,
          action.payload.message,
        )
        .pipe(
          map(() => actions.inviteUser.success()),
          takeUntil(
            action$.pipe(filter(isActionOf(actions.inviteUser.cancel))),
          ),
          catchError(error =>
            of(actions.inviteUser.failure({ error, resource: action.payload })),
          ),
        ),
    ),
  )
