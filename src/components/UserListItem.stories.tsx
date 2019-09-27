import React from 'react'

import UserListItem from './UserListItem'

export default { title: 'User List Item' }

export const withName = () => (
  <UserListItem
    user={{
      username: 'test1.id.blockstack',
      name: 'Jon Doe',
    }}
  />
)

export const withoutName = () => (
  <UserListItem
    user={{
      username: 'test1.id.blockstack',
    }}
  />
)

export const withMessage = () => (
  <UserListItem
    message="Let me invite you to my album 'Foo bar'."
    user={{
      username: 'test1.id.blockstack',
    }}
  />
)

export const withNameAndMessage = () => (
  <UserListItem
    message="Let me invite you to my album 'Foo bar'."
    user={{
      username: 'test1.id.blockstack',
      name: 'Jon Doe',
    }}
  />
)
