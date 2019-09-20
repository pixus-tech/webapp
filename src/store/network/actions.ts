import { API } from 'typings/types'

import { DownloadData, UploadData, UploadSuccessData } from './types'
import BaseRecord from 'db/index'

import {
  CancelJobPayload,
  createEnqueueableAction,
  QueuePayload,
} from 'utils/queue'

export const upload = createEnqueueableAction(
  'NETWORK__UPLOAD__REQUEST',
  'NETWORK__UPLOAD__SUCCESS',
  'NETWORK__UPLOAD__FAILURE',
  'NETWORK__UPLOAD__CANCEL',
)<
  QueuePayload<UploadData>,
  QueuePayload<UploadSuccessData>,
  QueuePayload<API.ErrorResponse<UploadData>>,
  CancelJobPayload
>()

export const download = createEnqueueableAction(
  'NETWORK__DOWNLOAD__REQUEST',
  'NETWORK__DOWNLOAD__SUCCESS',
  'NETWORK__DOWNLOAD__FAILURE',
  'NETWORK__DOWNLOAD__CANCEL',
)<
  QueuePayload<string>,
  QueuePayload<DownloadData>,
  QueuePayload<API.ErrorResponse<string>>,
  CancelJobPayload
>()

export const saveRecord = createEnqueueableAction(
  'NETWORK__SAVE_RECORD__REQUEST',
  'NETWORK__SAVE_RECORD__SUCCESS',
  'NETWORK__SAVE_RECORD__FAILURE',
  'NETWORK__SAVE_RECORD__CANCEL',
)<
  QueuePayload<BaseRecord>,
  QueuePayload<BaseRecord>,
  QueuePayload<API.ErrorResponse<BaseRecord>>,
  CancelJobPayload
>()
