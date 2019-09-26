import { combineEpics } from 'redux-observable'

import {
  addAlbumEpic,
  fetchAlbumTreeEpic,
  saveAlbumEpic,
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
  cancelJobGroupEpic,
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
  cancelJobGroupEpic,
  dequeueJobEpic,
  downloadPreviewImageEpic,
  downloadEpic,
  fetchAlbumTreeEpic,
  getAlbumImagesEpic,
  jobProgressEpic,
  performJobEpic,
  queueWorkerEpic,
  readFileEpic,
  saveAlbumEpic,
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