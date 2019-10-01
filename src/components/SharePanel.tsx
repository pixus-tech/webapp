import _ from 'lodash'
import cx from 'classnames'
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'

import GroupAddIcon from '@material-ui/icons/GroupAdd'
import UserAvatar, { AVATAR_SIZE } from 'components/UserAvatar'
import User from 'models/user'

export interface IProps {
  className?: string
  onAddUser: () => void
  users: User[]
}

const AVATAR_OVERLAP = 0.62 * AVATAR_SIZE
const AVATAR_GAP = 6

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
    },
    button: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '50%',
      color: theme.palette.secondary.contrastText,
      height: AVATAR_SIZE,
      minWidth: AVATAR_SIZE,
      padding: 0,
      width: AVATAR_SIZE,
    },
    container: {
      '& > *': {
        marginLeft: -AVATAR_OVERLAP,
        transition: 'margin-left 100ms ease-out',
      },
      '&:hover': {
        paddingLeft: -AVATAR_GAP,
      },
      '&:hover > *': {
        marginLeft: AVATAR_GAP,
      },
      display: 'flex',
      justifyContent: 'flex-end',
      paddingLeft: AVATAR_OVERLAP,
    },
  }),
)

function SharePanel({ className, onAddUser, users }: IProps) {
  const classes = useStyles()

  return (
    <div className={cx(classes.container, className)}>
      {_.map(users, (user, index) => (
        <UserAvatar key={index} className={classes.avatar} user={user} />
      ))}
      <Button
        aria-label="add user to group"
        className={classes.button}
        color="secondary"
        onClick={onAddUser}
        variant="contained"
      >
        <GroupAddIcon />
      </Button>
    </div>
  )
}

export default SharePanel
