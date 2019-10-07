import React from 'react'

import { userLabel } from 'models/user'
import { inviteUsers } from 'store/sharing/actions'

type PayloadType = Parameters<typeof inviteUsers.success>[0]

export default function InviteUsersSucceeded({
  resource: { users, album },
}: PayloadType) {
  return (
    <>
      You&apos;ve successfully invited {users.map(userLabel).join(', ')} to{' '}
      {album.name}.
    </>
  )
}
