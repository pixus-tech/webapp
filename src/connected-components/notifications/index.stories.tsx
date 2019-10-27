import React from 'react'

import NotificationWrapper from './'
import Notification, { NotificationType } from 'models/notification'

export default { title: 'Notifications' }

const albumInvite: Notification = {
  addressee: 'addressee.id.blockstack',
  creator: 'sender.id.blockstack',
  createdAt: new Date().getTime(),
  isRead: false,
  message: 'Do you want to collaborate on this album?',
  targetId: 'an-albums-id',
  type: NotificationType.AlbumInvite,
}

export const albumInviteNotification = () => (
  <NotificationWrapper notification={albumInvite} />
)
