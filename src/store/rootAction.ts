import * as albumsActions from './albums/actions'
import * as authActions from './auth/actions'
import * as i18nActions from './i18n/actions'
import * as imagesActions from './images/actions'
import * as modalActions from './modal/actions'
import * as notificationsActions from './notifications/actions'
import * as sharingActions from './sharing/actions'
import * as toastsActions from './toasts/actions'
import * as webSocketActions from './webSocket/actions'

const rootAction = {
  ...albumsActions,
  ...authActions,
  ...i18nActions,
  ...imagesActions,
  ...modalActions,
  ...notificationsActions,
  ...sharingActions,
  ...toastsActions,
  ...webSocketActions,
}

export default rootAction
