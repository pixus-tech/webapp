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
      users.find(action.payload).pipe(
        map(user => actions.findUser.success(user)),
        takeUntil(
          action$.pipe(
            filter(
              cancelAction =>
                isActionOf(actions.findUser.cancel)(cancelAction) &&
                action.payload === cancelAction.payload,
            ),
          ),
        ),
        catchError(error =>
          of(actions.findUser.failure({ error, resource: action.payload })),
        ),
      ),
    ),
  )

export const searchUsersEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'users'>
> = (action$, state$, { users }) =>
  action$.pipe(
    filter(isActionOf(actions.searchUsers.request)),
    mergeMap(action =>
      users.search(action.payload).pipe(
        map(users => actions.searchUsers.success(users)),
        takeUntil(
          action$.pipe(
            filter(
              cancelAction =>
                isActionOf(actions.searchUsers.cancel)(cancelAction) &&
                action.payload === cancelAction.payload,
            ),
          ),
        ),
        catchError(error =>
          of(actions.searchUsers.failure({ error, resource: action.payload })),
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
