import { API } from 'typings/types'
import { createAsyncAction } from 'typesafe-actions'
import SettingsSchema from 'models/settings'

export const saveSettings = createAsyncAction(
  'SETTINGS__SAVE__REQUEST',
  'SETTINGS__SAVE__SUCCESS',
  'SETTINGS__SAVE__FAILURE',
  'SETTINGS__SAVE__CANCEL',
)<
  SettingsSchema,
  SettingsSchema,
  API.ErrorResponse<SettingsSchema>,
  undefined
>()

export const loadSettings = createAsyncAction(
  'SETTINGS__LOAD__REQUEST',
  'SETTINGS__LOAD__SUCCESS',
  'SETTINGS__LOAD__FAILURE',
  'SETTINGS__LOAD__CANCEL',
)<undefined, SettingsSchema, API.ErrorResponse<undefined>, undefined>()
