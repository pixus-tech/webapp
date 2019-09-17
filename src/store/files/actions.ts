import { API } from 'typings/types'
import { createAsyncAction, createStandardAction } from 'typesafe-actions'

import { FileHandle, FileHandleWithData } from 'models/fileHandle'

export const _enqueueReadFile = createStandardAction('FILES__ENQUEUE_READ')<
  FileHandle
>()

export const _dequeueReadFile = createStandardAction('FILES__DEQUEUE_READ')<
  undefined
>()

export const _performReadFile = createStandardAction('FILES__PERFORM_READ')<
  FileHandle
>()

export const readFile = createAsyncAction(
  'FILES__READ_REQUEST',
  'FILES__READ_SUCCESS',
  'FILES__READ_FAILURE',
  'FILES__READ_CANCEL',
)<FileHandle, FileHandleWithData, API.ErrorResponse<FileHandle>, string>()
