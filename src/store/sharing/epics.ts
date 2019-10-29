import { Epic } from 'redux-observable'
import { of } from 'rxjs'
import {
  catchError,
  filter,
  map,
  mergeMap,
  takeUntil,
  tap,
  withLatestFrom,
  ignoreElements,
} from 'rxjs/operators'
import {
  isActionOf,
  RootAction,
  RootService,
  RootState,
} from 'typesafe-actions'

import * as actions from './actions'
import { hideModal } from 'store/modal/actions'
import { setNotificationRead } from 'store/notifications/actions'
import User from 'models/user'
import Analytics from 'utils/analytics'
import { redirect, buildAlbumRoute } from 'utils/routes'

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

export const selectUsersEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
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
    tap(() => Analytics.track('shareAlbum')),
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

export const acceptInvitationEpic: Epic<
  RootAction,
  RootAction,
  RootState,
  Pick<RootService, 'users'>
> = (action$, state$, { users }) =>
  action$.pipe(
    filter(isActionOf(actions.acceptInvitation.request)),
    mergeMap(({ payload }) => {
      const invitationId = payload.targetId

      if (invitationId === undefined) {
        return of(
          actions.acceptInvitation.failure({
            error: Error('InvitationId was not found in notification.'),
            resource: payload,
          }),
        )
      }

      return users.acceptInvitation(invitationId).pipe(
        mergeMap(album =>
          of(
            actions.acceptInvitation.success(album),
            setNotificationRead.request(payload),
          ),
        ),
        takeUntil(
          action$.pipe(
            filter(isActionOf(actions.acceptInvitation.cancel)),
            filter(cancel => cancel.payload._id === payload._id),
          ),
        ),
        catchError(error =>
          of(actions.acceptInvitation.failure({ error, resource: payload })),
        ),
      )
    }),
  )

export const redirectToAlbumEpic: Epic<
  RootAction,
  RootAction,
  RootState
> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.acceptInvitation.success)),
    tap(action => redirect(buildAlbumRoute(action.payload))),
    ignoreElements(),
  )

export const declineInvitationEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(isActionOf(actions.declineInvitation.request)),
    map(({ payload }) => setNotificationRead.request(payload)),
  )
