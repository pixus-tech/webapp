import { UserSession } from 'blockstack'
import { appConfig } from 'constants/blockstack'
import { configure } from 'radiks'

const userSession = new UserSession({ appConfig })

configure({
  apiServer: process.env.REACT_APP_RADIKS_URL || 'http://localhost:1260',
  userSession,
})

export default userSession
