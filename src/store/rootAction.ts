import * as albumsActions from './albums/actions'
import * as authActions from './auth/actions'
import * as filesActions from './files/actions'
import * as i18nActions from './i18n/actions'
import * as imagesActions from './images/actions'
import * as networkActions from './network/actions'
import * as timerActions from './timer/actions'
import * as webSocketActions from './webSocket/actions'

const rootAction = {
  ...albumsActions,
  ...authActions,
  ...filesActions,
  ...i18nActions,
  ...imagesActions,
  ...networkActions,
  ...timerActions,
  ...webSocketActions,
}

export default rootAction
