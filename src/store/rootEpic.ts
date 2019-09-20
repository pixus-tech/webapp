import { combineEpics } from 'redux-observable'

import {
  addAlbumEpic,
  fetchAlbumTreeEpic,
  setParentAlbumEpic,
} from './albums/epics'
import { readFileEpic } from './files/epics'
import {
  downloadPreviewImageEpic,
  getAlbumImagesEpic,
  uploadImageToAlbumEpic,
  uploadImagesToAlbumEpic,
  saveImageEpic,
} from './images/epics'
import { downloadEpic, uploadEpic, saveRecordEpic } from './network/epics'
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
  dequeueJobEpic,
  downloadPreviewImageEpic,
  downloadEpic,
  fetchAlbumTreeEpic,
  getAlbumImagesEpic,
  jobProgressEpic,
  performJobEpic,
  queueWorkerEpic,
  readFileEpic,
  saveImageEpic,
  saveRecordEpic,
  setParentAlbumEpic,
  subscribeWebSocketEpic,
  unsubscribeWebSocketEpic,
  uploadEpic,
  uploadImageToAlbumEpic,
  uploadImagesToAlbumEpic,
)

export default rootEpic
