import React from 'react'

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import BlankSlate from 'connected-components/blank-slates/BlankSlate'
import routes, { redirect } from 'utils/routes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginTop: theme.spacing(2),
    },
    root: {
      color: theme.palette.primary.contrastText,
      height: '100%',
      width: '100%',
    },
  }),
)

function redirectToLogin() {
  redirect(routes.login)
}

function SignInFailure() {
  const classes = useStyles()

  return (
    <BlankSlate
      className={classes.root}
      headline="Sign in failed"
      type="signingIn"
    >
      <span>Unfortunately, the sign in failed. Please try it again.</span>
      <br />
      <Button
        color="secondary"
        variant="outlined"
        onClick={redirectToLogin}
        className={classes.button}
      >
        Try again
      </Button>
    </BlankSlate>
  )
}

export default SignInFailure
