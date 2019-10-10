import _ from 'lodash'
import cx from 'classnames'
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'

import GroupAddIcon from '@material-ui/icons/GroupAdd'
import UserAvatar, { AVATAR_SIZE } from 'components/UserAvatar'
import User from 'models/user'

export interface IProps {
  className?: string
  onAddUser: () => void
  users: User[]
}

const MAX_USERS_PER_GROUP = 1000
const AVATAR_OVERLAP = 0.42 * AVATAR_SIZE
const AVATAR_GAP = 6

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatarWrapper: {
      borderRadius: '50%',
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
        border: `2px solid ${theme.palette.primary.main}`,
        boxSizing: 'content-box',
        marginRight: -AVATAR_OVERLAP,
        transition: 'margin-right 100ms ease-out',
      },
      '&:hover': {
        paddingRight: -AVATAR_GAP,
      },
      '&:hover > *': {
        marginRight: AVATAR_GAP,
      },
      display: 'flex',
      justifyContent: 'flex-end',
      paddingRight: AVATAR_OVERLAP,
    },
  }),
)

function SharePanel({ className, onAddUser, users }: IProps) {
  const classes = useStyles()

  return (
    <div className={cx(classes.container, className)}>
      <Tooltip title="Invite users to this album">
        <Button
          aria-label="add user to group"
          className={classes.button}
          color="secondary"
          onClick={onAddUser}
          variant="contained"
          style={{ zIndex: MAX_USERS_PER_GROUP }}
        >
          <GroupAddIcon />
        </Button>
      </Tooltip>
      {_.map(users, (user, index) => (
        <Tooltip key={index} title={user.username}>
          <div
            style={{ zIndex: MAX_USERS_PER_GROUP - (index + 1) }}
            className={classes.avatarWrapper}
          >
            <UserAvatar user={user} />
          </div>
        </Tooltip>
      ))}
    </div>
  )
}

export default SharePanel
