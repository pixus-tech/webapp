import * as albumsActions from './albums/actions'
import * as authActions from './auth/actions'
import * as filesActions from './files/actions'
import * as i18nActions from './i18n/actions'
import * as imagesActions from './images/actions'
import * as networkActions from './network/actions'
import * as queueActions from './queue/actions'
import * as webSocketActions from './webSocket/actions'

import { saveImage } from './images/actions'
import { readFile } from './files/actions'
import { upload } from './network/actions'

const rootAction = {
  ...albumsActions,
  ...authActions,
  ...filesActions,
  ...i18nActions,
  ...imagesActions,
  ...networkActions,
  ...queueActions,
  ...webSocketActions,
}

export const enqueueableActions = {
  readFile,
  saveImage,
  upload,
}

export default rootAction
