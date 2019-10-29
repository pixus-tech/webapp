import React from 'react'

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Illustration from 'components/illustrations'

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

function SigningIn() {
  const classes = useStyles()

  return (
    <div className={classes.container}>
      <Typography color="inherit" align="center" variant="h6" component="h2">
        <CircularProgress color="secondary" size={18} />
        &nbsp; signing in...
      </Typography>
      <Illustration className={classes.illustration} type="signingIn" />
    </div>
  )
}

export default SigningIn
