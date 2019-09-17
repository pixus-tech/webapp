import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'

import { UploadData, UploadSuccessData } from './types'

export const _enqueueUpload = createStandardAction('UPLOAD__ENQUEUE')<
  UploadData
>()

export const _dequeueUpload = createStandardAction('UPLOAD__DEQUEUE')<
  undefined
>()

export const _performUpload = createStandardAction('UPLOAD__PERFORM')<
  UploadData
>()

export const upload = createAsyncAction(
  'UPLOAD__REQUEST',
  'UPLOAD__SUCCESS',
  'UPLOAD__FAILURE',
  'UPLOAD__CANCEL',
)<UploadData, UploadSuccessData, API.ErrorResponse<UploadData>, string>()
