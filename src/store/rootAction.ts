import * as albumsActions from './albums/actions'
import * as authActions from './auth/actions'
import * as filesActions from './files/actions'
import * as i18nActions from './i18n/actions'
import * as imagesActions from './images/actions'
import * as modalActions from './modal/actions'
import * as networkActions from './network/actions'
import * as queueActions from './queue/actions'
import * as sharingActions from './sharing/actions'
import * as webSocketActions from './webSocket/actions'

import { readFile } from './files/actions'
import { download, upload, saveRecord } from './network/actions'

const rootAction = {
  ...albumsActions,
  ...authActions,
  ...filesActions,
  ...i18nActions,
  ...imagesActions,
  ...modalActions,
  ...networkActions,
  ...queueActions,
  ...sharingActions,
  ...webSocketActions,
}

export const enqueueableActions = {
  download,
  readFile,
  saveRecord,
  upload,
}

export default rootAction
