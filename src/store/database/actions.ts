import { createAsyncAction, createStandardAction } from 'typesafe-actions'

export const setDirty = createStandardAction('DATABASE__PROBE')<number>()

export const loadDatabase = createAsyncAction(
  'DATABASE__LOAD__REQUEST',
  'DATABASE__LOAD__SUCCESS',
  'DATABASE__LOAD__FAILURE',
  'DATABASE__LOAD__CANCEL',
)<undefined, boolean, undefined, undefined>()

export const saveDatabase = createAsyncAction(
  'DATABASE__SAVE__REQUEST',
  'DATABASE__SAVE__SUCCESS',
  'DATABASE__SAVE__FAILURE',
  'DATABASE__SAVE__CANCEL',
)<undefined, boolean, undefined, undefined>()
