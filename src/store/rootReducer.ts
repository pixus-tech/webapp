import { combineReducers } from 'redux'

import albums, { initialState as initialAlbumsState } from './albums/reducers'
import auth, { initialState as initialAuthState } from './auth/reducers'
import connectivity, {
  initialState as initialConnectivityState,
} from './connectivity/reducers'
import database, {
  initialState as initialDatabaseState,
} from './database/reducers'
import i18n, { initialState as initialI18nState } from './i18n/reducers'
import images, { initialState as initialImagesState } from './images/reducers'
import modal, { initialState as initialModalState } from './modal/reducers'
import notifications, {
  initialState as initialNotificationsState,
} from './notifications/reducers'
import settings, {
  initialState as initialSettingsState,
} from './settings/reducers'
import sharing, {
  initialState as initialSharingState,
} from './sharing/reducers'
import toasts, { initialState as initialToastsState } from './toasts/reducers'

const rootReducer = combineReducers({
  albums,
  auth,
  connectivity,
  database,
  i18n,
  images,
  modal,
  notifications,
  settings,
  sharing,
  toasts,
})

export const initialState = {
  albums: initialAlbumsState,
  auth: initialAuthState,
  connectivity: initialConnectivityState,
  database: initialDatabaseState,
  i18n: initialI18nState,
  images: initialImagesState,
  modal: initialModalState,
  notifications: initialNotificationsState,
  settings: initialSettingsState,
  sharing: initialSharingState,
  toasts: initialToastsState,
}

export default rootReducer
