import { Person } from 'blockstack'
import { createStandardAction } from 'typesafe-actions'

export const setUser = createStandardAction('AUTH__SET_USER')<Person>()
export const logout = createStandardAction('AUTH__LOGOUT')<undefined>()
