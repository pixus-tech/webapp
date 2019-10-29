import { API } from 'typings/types'
import { createAsyncAction } from 'typesafe-actions'
import Album from 'models/album'
import User from 'models/user'
import Notification from 'models/notification'

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
  users: User[]
  message?: string
}

export const inviteUsers = createAsyncAction(
  'SHARING__INVITE_USERS__REQUEST',
  'SHARING__INVITE_USERS__SUCCESS',
  'SHARING__INVITE_USERS__FAILURE',
  'SHARING__INVITE_USERS__CANCEL',
)<
  UserInvitationPayload,
  API.PutResponse<UserInvitationPayload>,
  API.ErrorResponse<UserInvitationPayload>,
  undefined
>()

export const selectUsers = createAsyncAction(
  'SHARING__SELECT_USERS__REQUEST',
  'SHARING__SELECT_USERS__SUCCESS',
  'SHARING__SELECT_USERS__FAILURE',
  'SHARING__SELECT_USERS__CANCEL',
)<string[], User[], undefined, undefined>()

export const acceptInvitation = createAsyncAction(
  'SHARING__ACCEPT_INVITATION__REQUEST',
  'SHARING__ACCEPT_INVITATION__SUCCESS',
  'SHARING__ACCEPT_INVITATION__FAILURE',
  'SHARING__ACCEPT_INVITATION__CANCEL',
)<Notification, Album, API.ErrorResponse<Notification>, Notification>()

export const declineInvitation = createAsyncAction(
  'SHARING__DECLINE_INVITATION__REQUEST',
  'SHARING__DECLINE_INVITATION__SUCCESS',
  'SHARING__DECLINE_INVITATION__FAILURE',
  'SHARING__DECLINE_INVITATION__CANCEL',
)<Notification, boolean, API.ErrorResponse<Notification>, Notification>()
