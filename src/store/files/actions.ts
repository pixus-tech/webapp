import { API } from 'typings/types'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'
import { CancelJobPayload, createEnqueueableAction, QueuePayload } from 'utils/queue'

export const readFile = createEnqueueableAction(
  'FILES__READ__REQUEST',
  'FILES__READ__SUCCESS',
  'FILES__READ__FAILURE',
  'FILES__READ__CANCEL',
)<
  QueuePayload<FileHandle>,
  QueuePayload<FileHandleWithData>,
  QueuePayload<API.ErrorResponse<FileHandle>>,
  CancelJobPayload
>()
