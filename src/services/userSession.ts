import { UserSession } from 'blockstack'
import { appConfig } from 'constants/blockstack'
import { configure } from 'radiks'

import { getConfig } from './config'

const userSession = new UserSession({ appConfig })

const config = getConfig()

configure({
  apiServer: config.radiksUrl,
  userSession,
})

export default userSession
