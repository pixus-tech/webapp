import cx from 'classnames'
import randomColor from 'randomcolor'
import React from 'react'

import Avatar from '@material-ui/core/Avatar'
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles'

import User, { initials } from 'models/user'

export const AVATAR_SIZE = 40

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      color: theme.palette.primary.contrastText,
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
    },
  }),
)

export interface IProps {
  className?: string
  user: User
}

function UserAvatar({ className, user }: IProps) {
  const classes = useStyles()
  const theme = useTheme()
  const style: React.CSSProperties = {}

  if (!user.imageURL) {
    style.backgroundColor = randomColor({
      hue: theme.palette.secondary.main,
      luminosity: 'dark',
      seed: user.username,
    })
  }

  return (
    <Avatar
      key={user.username}
      alt={user.username}
      src={user.imageURL}
      className={cx(classes.avatar, className)}
      style={style}
    >
      {!user.imageURL && initials(user)}
    </Avatar>
  )
}

export default UserAvatar
