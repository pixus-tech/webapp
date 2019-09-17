import { createReducer } from 'typesafe-actions'

import { setLocale } from './actions'
import { Locales } from './types'

export const initialState = 'en' as Locales

export const locale = createReducer(initialState).handleAction(
  setLocale,
  (_state, action) => action.payload,
)

export default locale
