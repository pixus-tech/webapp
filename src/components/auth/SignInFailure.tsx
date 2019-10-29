import React from 'react'

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Illustration from 'components/illustrations'

import routes, { redirect } from 'utils/routes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      alignItems: 'center',
      color: theme.palette.primary.contrastText,
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
      justifyContent: 'center',
      width: '100%',
    },
    illustration: {
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(1),
      },
      height: 320,
      maxWidth: 320,
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
    <div className={classes.container}>
      <Typography color="inherit" align="center" variant="h6" component="h2">
        Unfortunately, the sign in failed. Please try it again.
      </Typography>
      <Illustration className={classes.illustration} type="signInFailure" />
      <Button color="secondary" variant="outlined" onClick={redirectToLogin}>
        Try again
      </Button>
    </div>
  )
}

export default SignInFailure
