import _ from 'lodash'
import { Epic } from 'redux-observable'
import { filter, map } from 'rxjs/operators'
import { RootAction } from 'typesafe-actions'

import { ToastVariant } from 'components/Toast'
import * as actions from './actions'

function actionVariant(action: RootAction): ToastVariant {
  if (action.type.endsWith('FAILURE')) {
    return 'error'
  }

  if (action.type.endsWith('CANCEL')) {
    return 'warning'
  }

  if (action.type.endsWith('SUCCESS')) {
    return 'success'
  }

  return 'info'
}

export const toastEpic: Epic<RootAction, RootAction> = action$ =>
  action$.pipe(
    filter(action => _.get(action, 'payload.showToast') === true),
    map(action =>
      actions.showToast({
        action,
        payload: _.get(action, 'payload'),
        variant: actionVariant(action),
      }),
    ),
  )
