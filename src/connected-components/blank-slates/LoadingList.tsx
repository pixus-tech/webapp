import React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import BlankSlate from './BlankSlate'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    progress: {
      marginRight: theme.spacing(2),
    },
  }),
)

interface IProps {
  className?: string
}

function LoadingList({ className }: IProps) {
  const classes = useStyles()

  return (
    <BlankSlate
      className={className}
      headline="Album is loading"
      type="loading"
    >
      <CircularProgress
        color="secondary"
        size={16}
        className={classes.progress}
      />
      <span>Your photos are fetched, decrypted and will appear shortly.</span>
    </BlankSlate>
  )
}

export default LoadingList
