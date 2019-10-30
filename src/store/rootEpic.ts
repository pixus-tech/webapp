import _ from 'lodash'
import { combineEpics } from 'redux-observable'

import * as albumEpics from './albums/epics'
import * as authEpics from './auth/epics'
import * as connectivityEpics from './connectivity/epics'
import * as databaseEpics from './database/epics'
import * as imageEpics from './images/epics'
import * as notificationsEpics from './notifications/epics'
import * as settingsEpics from './settings/epics'
import * as sharingEpics from './sharing/epics'
import * as toastsEpics from './toasts/epics'

const rootEpic = combineEpics(
  ..._.values(albumEpics),
  ..._.values(authEpics),
  ..._.values(connectivityEpics),
  ..._.values(databaseEpics),
  ..._.values(imageEpics),
  ..._.values(notificationsEpics),
  ..._.values(settingsEpics),
  ..._.values(sharingEpics),
  ..._.values(toastsEpics),
)

export default rootEpic
