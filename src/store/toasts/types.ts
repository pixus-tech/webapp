import { EmptyAction, PayloadAction } from 'typesafe-actions'
import { ToastVariant } from 'components/Toast'

export interface Toast<T extends string = any, P = any> {
  action: EmptyAction<T> | PayloadAction<T, P>
  payload: P
  variant: ToastVariant
}
