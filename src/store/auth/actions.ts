import { createStandardAction } from 'typesafe-actions'

import { UserData } from 'models/blockstack'

export const setUser = createStandardAction('AUTH__SET_USER')<UserData>()
export const logout = createStandardAction('AUTH__LOGOUT')<undefined>()
