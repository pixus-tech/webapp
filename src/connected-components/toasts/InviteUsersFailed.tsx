import React from 'react'

import { inviteUsers } from 'store/sharing/actions'

type PayloadType = Parameters<typeof inviteUsers.failure>[0]

export default function InviteUsersFailed({
  error,
  resource: { album },
}: PayloadType) {
  return (
    <>
      Inviting users to {album.name} failed: {error.message}.
    </>
  )
}
