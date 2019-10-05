import React from 'react'
import InviteUserForm from './InviteUserForm'

export default { title: 'Invite User Form' }

export const isFetchingUser = () => (
  <div style={{ height: 256, width: 256 }}>
    <InviteUserForm
      isFetchingSuggestions={true}
      onChangeSelectedUsers={console.log}
      onChangeUsername={console.log}
      onSubmit={console.log}
      selectedUsers={[]}
      suggestedUsers={[]}
    />
  </div>
)

export const didFindUser = () => (
  <div style={{ height: 256, width: 256 }}>
    <InviteUserForm
      isFetchingSuggestions={false}
      onChangeSelectedUsers={console.log}
      onChangeUsername={console.log}
      onSubmit={console.log}
      selectedUsers={[]}
      suggestedUsers={[
        {
          username: 'test1.id.blockstack',
          name: 'Jon Doe',
        },
      ]}
    />
  </div>
)

export const didSelectUser = () => (
  <div style={{ height: 256, width: 256 }}>
    <InviteUserForm
      isFetchingSuggestions={false}
      onChangeSelectedUsers={console.log}
      onChangeUsername={console.log}
      onSubmit={console.log}
      selectedUsers={[
        {
          username: 'test1.id.blockstack',
          name: 'Jon Doe',
        },
      ]}
      suggestedUsers={[]}
    />
  </div>
)
