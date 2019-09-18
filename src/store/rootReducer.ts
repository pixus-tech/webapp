import { combineReducers } from 'redux'

import albums, { initialState as initialAlbumsState } from './albums/reducers'
import auth, { initialState as initialAuthState } from './auth/reducers'
import files, { initialState as initialFilesState } from './files/reducers'
import i18n, { initialState as initialI18nState } from './i18n/reducers'
import images, { initialState as initialImagesState } from './images/reducers'
import network, {
  initialState as initialNetworkState,
} from './network/reducers'
import queue, { initialState as initialQueueState } from './queue/reducers'
import webSocket, {
  initialState as initialWebSocketState,
} from './webSocket/reducers'

const rootReducer = combineReducers({
  albums,
  auth,
  files,
  i18n,
  images,
  network,
  queue,
  webSocket,
})

export const initialState = {
  albums: initialAlbumsState,
  auth: initialAuthState,
  files: initialFilesState,
  i18n: initialI18nState,
  images: initialImagesState,
  network: initialNetworkState,
  queue: initialQueueState,
  webSocket: initialWebSocketState,
}

export default rootReducer
