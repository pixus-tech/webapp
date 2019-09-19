import { combineEpics } from 'redux-observable'

import {
  addAlbumEpic,
  fetchAlbumTreeEpic,
  setParentAlbumEpic,
} from './albums/epics'
import { readFileEpic } from './files/epics'
import {
  getAlbumImagesEpic,
  uploadImageToAlbumEpic,
  uploadImagesToAlbumEpic,
  saveImageEpic,
} from './images/epics'
import { uploadEpic } from './network/epics'
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
  fetchAlbumTreeEpic,
  getAlbumImagesEpic,
  jobProgressEpic,
  performJobEpic,
  queueWorkerEpic,
  readFileEpic,
  saveImageEpic,
  setParentAlbumEpic,
  subscribeWebSocketEpic,
  unsubscribeWebSocketEpic,
  uploadEpic,
  uploadImageToAlbumEpic,
  uploadImagesToAlbumEpic,
)

export default rootEpic
