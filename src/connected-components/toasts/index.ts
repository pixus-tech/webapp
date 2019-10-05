import { PayloadAC } from 'typesafe-actions'

import { downloadPreviewImage } from 'store/images/actions'
import { inviteUsers } from 'store/sharing/actions'

import ImagePreviewDownloadFailed from './ImagePreviewDownloadFailed'
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
