import _ from 'lodash'
import { combineEpics } from 'redux-observable'

import * as albumEpics from './albums/epics'
import * as authEpics from './auth/epics'
import * as fileEpics from './files/epics'
import * as imageEpics from './images/epics'
import * as networkEpics from './network/epics'
import * as notificationsEpics from './notifications/epics'
import * as queueEpics from './queue/epics'
import * as webSocketEpics from './webSocket/epics'
import * as sharingEpics from './sharing/epics'

const rootEpic = combineEpics(
  ..._.values(albumEpics),
  ..._.values(authEpics),
  ..._.values(fileEpics),
  ..._.values(imageEpics),
  ..._.values(networkEpics),
  ..._.values(notificationsEpics),
  ..._.values(queueEpics),
  ..._.values(webSocketEpics),
  ..._.values(sharingEpics),
)

export default rootEpic
