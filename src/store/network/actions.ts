import { API } from 'typings/types'

import { UploadData, UploadSuccessData } from './types'
import {
  CancelJobPayload,
  createEnqueueableAction,
  QueuePayload,
} from 'utils/queue'

export const upload = createEnqueueableAction(
  'UPLOAD__REQUEST',
  'UPLOAD__SUCCESS',
  'UPLOAD__FAILURE',
  'UPLOAD__CANCEL',
)<
  QueuePayload<UploadData>,
  QueuePayload<UploadSuccessData>,
  QueuePayload<API.ErrorResponse<UploadData>>,
  CancelJobPayload
>()
