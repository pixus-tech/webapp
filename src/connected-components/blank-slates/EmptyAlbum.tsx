import React from 'react'

import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import BlankSlate from './BlankSlate'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(2, 1),
    },
  }),
)

interface IProps {
  className?: string
  inviteUsers: (e: React.MouseEvent<HTMLElement>) => void
}

function EmptyAlbum({ className, inviteUsers }: IProps) {
  const classes = useStyles()

  return (
    <BlankSlate
      className={className}
      headline="Album is empty"
      type="emptyList"
    >
      <span>
        Drag and drop photos to upload them or invite friends to let them add
        their photos.
      </span>
      <br />
      <Button className={classes.button} variant="outlined" color="secondary">
        Add photos
      </Button>
      <Button
        className={classes.button}
        variant="outlined"
        color="secondary"
        onClick={inviteUsers}
      >
        Invite friends
      </Button>
    </BlankSlate>
  )
}

export default EmptyAlbum
