import _ from 'lodash'
import cx from 'classnames'
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'

import GroupAddIcon from '@material-ui/icons/GroupAdd'

interface Person {
  username: string
  initials?: string
  imageURL?: string
}

export interface IProps {
  className?: string
  people: Person[]
}

const AVATAR_SIZE = 48
const AVATAR_OVERLAP = 0.62 * AVATAR_SIZE
const AVATAR_GAP = 6

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatar: {
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
    },
    button: {
      backgroundColor: theme.palette.primary.main,
      borderRadius: '50%',
      color: theme.palette.primary.contrastText,
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

function SharePanel({ className, people }: IProps) {
  const classes = useStyles()

  return (
    <div className={cx(className, classes.container)}>
      {_.map(people, person => {
        const initials =
          person.initials || person.username.slice(0, 1).toUpperCase()
        return (
          <Avatar
            key={person.username}
            alt={person.username}
            src={person.imageURL}
            className={classes.avatar}
          >
            {!person.imageURL && initials}
          </Avatar>
        )
      })}
      <Button
        className={classes.button}
        aria-label="add user to group"
        color="primary"
        variant="contained"
      >
        <GroupAddIcon />
      </Button>
    </div>
  )
}

export default SharePanel
