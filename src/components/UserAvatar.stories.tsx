import React from 'react'
import UserAvatar from './UserAvatar'

export default { title: 'User Avatar' }

export const withName = () => (
  <UserAvatar
    user={{
      username: 'test1.id.blockstack',
      name: 'Jon Doe',
    }}
  />
)

export const withImage = () => (
  <UserAvatar
    user={{
      username: 'test2.id.blockstack',
      imageURL: 'https://via.placeholder.com/64x64.jpg?text=TK',
    }}
  />
)

export const withoutImageOrInitials = () => (
  <UserAvatar
    user={{
      username: 'test1.id.blockstack',
    }}
  />
)
