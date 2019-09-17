import { createStandardAction } from 'typesafe-actions'

import { Locales } from './types'

export const setLocale = createStandardAction('I18N__SET_LOCALE')<Locales>()
