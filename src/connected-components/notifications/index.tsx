import React from 'react'

import Notification, { NotificationType } from 'models/notification'

import AlbumInvitationNotification from './AlbumInvitation'

const NOTIFICATION_COMPONENTS = {
  [NotificationType.AlbumInvite]: AlbumInvitationNotification,
  [NotificationType.NewAlbumImages]: AlbumInvitationNotification,
  [NotificationType.Unknown]: AlbumInvitationNotification,
  [NotificationType.UserJoinedGroup]: AlbumInvitationNotification,
}

export interface NotificationProps {
  notification: Notification
}

function NotificationWrapper({ notification }: NotificationProps) {
  const NotificationComponent =
    NOTIFICATION_COMPONENTS[notification.type] || null

  if (NotificationComponent === null) {
    return null
  }

  return <NotificationComponent notification={notification} />
}

export default NotificationWrapper
