import * as albumsActions from './albums/actions'
import * as authActions from './auth/actions'
import * as connectivityActions from './connectivity/actions'
import * as databaseActions from './database/actions'
import * as i18nActions from './i18n/actions'
import * as imagesActions from './images/actions'
import * as modalActions from './modal/actions'
import * as notificationsActions from './notifications/actions'
import * as settingsActions from './settings/actions'
import * as sharingActions from './sharing/actions'
import * as toastsActions from './toasts/actions'

const rootAction = {
  ...albumsActions,
  ...authActions,
  ...connectivityActions,
  ...databaseActions,
  ...i18nActions,
  ...imagesActions,
  ...modalActions,
  ...notificationsActions,
  ...settingsActions,
  ...sharingActions,
  ...toastsActions,
}

export default rootAction
