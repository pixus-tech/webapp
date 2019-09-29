import React from 'react'

import UserListItem from './UserListItem'

export default { title: 'User List Item' }

export const withName = () => (
  <UserListItem
    component="div"
    user={{
      username: 'test1.id.blockstack',
      name: 'Jon Doe',
    }}
  />
)

export const withoutName = () => (
  <UserListItem
    component="div"
    user={{
      username: 'test1.id.blockstack',
    }}
  />
)

export const withMessage = () => (
  <UserListItem
    component="div"
    message="Let me invite you to my album 'Foo bar'."
    user={{
      username: 'test1.id.blockstack',
    }}
  />
)

export const withNameAndMessage = () => (
  <UserListItem
    component="div"
    message="Let me invite you to my album 'Foo bar'."
    user={{
      username: 'test1.id.blockstack',
      name: 'Jon Doe',
    }}
  />
)
