import { Epic } from 'redux-observable'
import { filter, ignoreElements, tap } from 'rxjs/operators'
import { isActionOf, RootAction, RootState } from 'typesafe-actions'

import * as actions from './actions'
import userSession from 'services/userSession'

export const logoutEpic: Epic<RootAction, RootAction, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    filter(isActionOf(actions.logout)),
    tap(() => userSession.signUserOut()),
    ignoreElements(),
  )
