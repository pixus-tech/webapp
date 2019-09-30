import { combineReducers } from 'redux'

import albums, { initialState as initialAlbumsState } from './albums/reducers'
import auth, { initialState as initialAuthState } from './auth/reducers'
import i18n, { initialState as initialI18nState } from './i18n/reducers'
import images, { initialState as initialImagesState } from './images/reducers'
import modal, { initialState as initialModalState } from './modal/reducers'
import notifications, {
  initialState as initialNotificationsState,
} from './notifications/reducers'
import sharing, {
  initialState as initialSharingState,
} from './sharing/reducers'
import webSocket, {
  initialState as initialWebSocketState,
} from './webSocket/reducers'

const rootReducer = combineReducers({
  albums,
  auth,
  i18n,
  images,
  modal,
  notifications,
  sharing,
  webSocket,
})

export const initialState = {
  albums: initialAlbumsState,
  auth: initialAuthState,
  i18n: initialI18nState,
  images: initialImagesState,
  modal: initialModalState,
  notifications: initialNotificationsState,
  sharing: initialSharingState,
  webSocket: initialWebSocketState,
}

export default rootReducer
