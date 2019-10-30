import React from 'react'

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import BlankSlate from 'connected-components/blank-slates/BlankSlate'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.primary.contrastText,
      height: '100%',
      width: '100%',
    },
  }),
)

function SigningIn() {
  const classes = useStyles()

  return (
    <BlankSlate
      className={classes.root}
      headline={
        <>
          <CircularProgress color="secondary" size={24} />
          &nbsp; Signing in...
        </>
      }
      type="signingIn"
    />
  )
}

export default SigningIn
