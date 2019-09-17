import { createStandardAction } from 'typesafe-actions'

export const startTimer = createStandardAction('TIMER__START')<number>()

export const stopTimer = createStandardAction('TIMER__STOP')<undefined>()
