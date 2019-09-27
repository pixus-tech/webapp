import React from 'react'
import InviteUserForm from './InviteUserForm'

export default { title: 'Invite User Form' }

export const isFetchingUser = () => (
  <div style={{ height: 256, width: 256 }}>
    <InviteUserForm
      onSubmit={console.log}
      onChangeUsername={console.log}
      isFetchingUser={true}
      user={undefined}
    />
  </div>
)

export const didFindUser = () => (
  <div style={{ height: 256, width: 256 }}>
    <InviteUserForm
      onSubmit={console.log}
      onChangeUsername={console.log}
      isFetchingUser={false}
      user={{
        username: 'test1.id.blockstack',
        name: 'Jon Doe',
      }}
    />
  </div>
)

export const couldNotFindUser = () => (
  <div style={{ height: 256, width: 256 }}>
    <InviteUserForm
      onSubmit={console.log}
      onChangeUsername={console.log}
      isFetchingUser={false}
      user={null}
    />
  </div>
)
