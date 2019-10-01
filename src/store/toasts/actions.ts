import { createStandardAction } from 'typesafe-actions'

import { Toast } from './types'

export const showToast = createStandardAction('TOASTS__SHOW')<Toast>()

export const hideToast = createStandardAction('TOASTS__HIDE')<Toast>()
