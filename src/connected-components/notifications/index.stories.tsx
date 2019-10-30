import React from 'react'

import NotificationWrapper from './'
import Notification, { NotificationType } from 'models/notification'

export default { title: 'Notifications' }

const albumInvite: Notification = {
  _id: '1',
  addressee: 'addressee.id.blockstack',
  createdAt: new Date().getTime(),
  creator: 'sender.id.blockstack',
  message: 'Do you want to collaborate on this album?',
  meta: { isRead: 0 },
  targetId: 'an-albums-id',
  type: NotificationType.AlbumInvite,
}

export const albumInviteNotification = () => (
  <ul>
    <NotificationWrapper notification={albumInvite} />
  </ul>
)
