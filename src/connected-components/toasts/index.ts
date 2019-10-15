import { PayloadAC } from 'typesafe-actions'

import { downloadPreviewImage, downloadImage } from 'store/images/actions'
import { inviteUsers } from 'store/sharing/actions'

import ImagePreviewDownloadFailed from './ImagePreviewDownloadFailed'
import ImageDownloadFailed from './ImageDownloadFailed'
import InviteUsersFailed from './InviteUsersFailed'
import InviteUsersSucceeded from './InviteUsersSucceeded'

function createMessageComponent<
  RequiredType extends string,
  RequiredPayload,
  Type extends RequiredType,
  Payload extends RequiredPayload,
  ComponentType extends (props: Payload) => JSX.Element
>(
  _: PayloadAC<RequiredType, RequiredPayload>,
  type: Type,
  Component: ComponentType,
) {
  return {
    [type]: Component,
  }
}

const TOAST_COMPONENTS = {
  ...createMessageComponent(
    downloadPreviewImage.failure,
    'IMAGES__DOWNLOAD_PREVIEW_IMAGE__FAILURE',
    ImagePreviewDownloadFailed,
  ),
  ...createMessageComponent(
    downloadImage.failure,
    'IMAGES__DOWNLOAD_IMAGE__FAILURE',
    ImageDownloadFailed,
  ),
  ...createMessageComponent(
    inviteUsers.success,
    'SHARING__INVITE_USERS__SUCCESS',
    InviteUsersSucceeded,
  ),
  ...createMessageComponent(
    inviteUsers.failure,
    'SHARING__INVITE_USERS__FAILURE',
    InviteUsersFailed,
  ),
}

export default TOAST_COMPONENTS
