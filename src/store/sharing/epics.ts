import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import {
  catchError,
  filter,
  map,
  mergeMap,
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
import { hideModal } from 'store/modal/actions'
import User from 'models/user'

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

export const selectUsersEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'users'>
> = (action$, state$, { users }) =>
  action$.pipe(
    filter(isActionOf(actions.selectUsers.request)),
    withLatestFrom(state$),
    map(([action, state]) => {
      const users: User[] = []

      action.payload.forEach(username => {
        const user =
          state.sharing.users.get(username) ||
          state.sharing.suggestedUsers.get(username)
        if (user !== undefined) {
          users.push(user)
        }
      })

      return actions.selectUsers.success(users)
    }),
  )

export const inviteUsersEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'users'>
> = (action$, state$, { users }) =>
  action$.pipe(
    filter(isActionOf(actions.inviteUsers.request)),
    mergeMap(action =>
      users
        .inviteUsersToAlbum(
          action.payload.users,
          action.payload.album,
          action.payload.message,
        )
        .pipe(
          mergeMap(() =>
            of(
              actions.inviteUsers.success({
                showToast: true,
                resource: action.payload,
              }),
              hideModal(),
            ),
          ),
          takeUntil(
            action$.pipe(filter(isActionOf(actions.inviteUsers.cancel))),
          ),
          catchError(error =>
            of(
              actions.inviteUsers.failure({
                showToast: true,
                error,
                resource: action.payload,
              }),
            ),
          ),
        ),
    ),
  )
