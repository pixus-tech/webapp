import { combineEpics } from 'redux-observable'

import {
  addAlbumEpic,
  fetchAlbumTreeEpic,
  setParentAlbumEpic,
} from './albums/epics'
import {
  readFileEpic,
} from './files/epics'
import {
  addImageFileToAlbumEpic,
  addImageFilesToAlbumEpic,
  createImageRecordEpic,
  getAlbumImagesEpic,
  processImageEpic,
  triggerImageFileReadEpic,
  triggerUploadImageDataEpic,
  uploadImageDataEpic,
} from './images/epics'
import {
  uploadEpic,
} from './network/epics'
import {
  dequeueJobEpic,
  jobProgressEpic,
  performJobEpic,
  queueWorkerEpic,
} from './queue/epics'
import {
  subscribeWebSocketEpic,
  unsubscribeWebSocketEpic,
} from './webSocket/epics'

const rootEpic = combineEpics(
  addAlbumEpic,
  addImageFileToAlbumEpic,
  addImageFilesToAlbumEpic,
  createImageRecordEpic,
  dequeueJobEpic,
  fetchAlbumTreeEpic,
  getAlbumImagesEpic,
  jobProgressEpic,
  performJobEpic,
  processImageEpic,
  queueWorkerEpic,
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
