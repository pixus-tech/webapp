import { combineEpics } from 'redux-observable'

import {
  addAlbumEpic,
  fetchAlbumTreeEpic,
  setParentAlbumEpic,
} from './albums/epics'
import {
  dequeueReadFileEpic,
  performReadFileEpic,
  readFileEpic,
} from './files/epics'
import {
  addImageFileToAlbumEpic,
  addImageFilesToAlbumEpic,
  createImageRecordEpic,
  getImagesEpic,
  processImageEpic,
  triggerImageFileReadEpic,
  triggerUploadImageDataEpic,
  uploadImageDataEpic,
} from './images/epics'
import {
  dequeueUploadEpic,
  performUploadEpic,
  uploadEpic,
} from './network/epics'
import { dequeueUploadTimerEpic, dequeueReadFileTimerEpic } from './timer/epics'
import {
  subscribeWebSocketEpic,
  unsubscribeWebSocketEpic,
} from './webSocket/epics'

const rootEpic = combineEpics(
  addAlbumEpic,
  addImageFileToAlbumEpic,
  addImageFilesToAlbumEpic,
  createImageRecordEpic,
  dequeueReadFileEpic,
  dequeueReadFileTimerEpic,
  dequeueUploadEpic,
  dequeueUploadTimerEpic,
  fetchAlbumTreeEpic,
  getImagesEpic,
  performReadFileEpic,
  performUploadEpic,
  processImageEpic,
  readFileEpic,
  setParentAlbumEpic,
  subscribeWebSocketEpic,
  triggerImageFileReadEpic,
  triggerUploadImageDataEpic,
  unsubscribeWebSocketEpic,
  uploadEpic,
  uploadImageDataEpic,
)

export default rootEpic
