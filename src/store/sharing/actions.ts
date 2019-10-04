import { API } from 'typings/types'
import { createAsyncAction } from 'typesafe-actions'
import Album from 'models/album'
import User from 'models/user'

export const findUser = createAsyncAction(
  'SHARING__FIND_USER__REQUEST',
  'SHARING__FIND_USER__SUCCESS',
  'SHARING__FIND_USER__FAILURE',
  'SHARING__FIND_USER__CANCEL',
)<string, API.ShowResponse<User>, API.ErrorResponse<string>, string>()

export const searchUsers = createAsyncAction(
  'SHARING__SEARCH_USERS__REQUEST',
  'SHARING__SEARCH_USERS__SUCCESS',
  'SHARING__SEARCH_USERS__FAILURE',
  'SHARING__SEARCH_USERS__CANCEL',
)<string, User[], API.ErrorResponse<string>, string>()

interface UserInvitationPayload {
  album: Album
  user: User
  message?: string
}

export const inviteUser = createAsyncAction(
  'SHARING__INVITE_USER__REQUEST',
  'SHARING__INVITE_USER__SUCCESS',
  'SHARING__INVITE_USER__FAILURE',
  'SHARING__INVITE_USER__CANCEL',
)<
  UserInvitationPayload,
  undefined,
  API.ErrorResponse<UserInvitationPayload>,
  undefined
>()
