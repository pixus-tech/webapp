import cx from 'classnames'
import React from 'react'

import Avatar from '@material-ui/core/Avatar'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import User from 'models/user'

export const AVATAR_SIZE = 40

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    avatar: {
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
    },
  }),
)

export interface IProps {
  className?: string
  user: User
}

function initialsFromName(name?: string) {
  if (!name) {
    return undefined
  }

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
}

function UserAvatar({ className, user }: IProps) {
  const classes = useStyles()
  const initials =
    initialsFromName(user.name) || user.username.slice(0, 1).toUpperCase()

  return (
    <Avatar
      key={user.username}
      alt={user.username}
      src={user.imageURL}
      className={cx(classes.avatar, className)}
    >
      {!user.imageURL && initials}
    </Avatar>
  )
}

export default UserAvatar
