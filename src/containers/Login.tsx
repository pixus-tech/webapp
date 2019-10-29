import React from 'react'
import compose from 'recompose/compose'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'

import LoginForm from 'components/login/LoginForm'
import Illustration from 'components/illustrations'

const styles = (theme: Theme) =>
  createStyles({
    illustration: {
      margin: `${theme.spacing(4)}px auto`,
      width: 256,
    },
    root: {
      color: theme.palette.primary.contrastText,
    },
  })

type StyleProps = WithStyles<typeof styles>

type ComposedProps = StyleProps

const Login: React.FC<ComposedProps> = ({ classes }) => (
  <div className={classes.root}>
    <Typography align="center" component="h1" variant="h4">
      You are signed out.
    </Typography>
    <Illustration className={classes.illustration} type="signIn" />
    <LoginForm />
  </div>
)

export default compose<ComposedProps, {}>(withStyles(styles))(Login)
