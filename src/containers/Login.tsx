import React from 'react'
import compose from 'recompose/compose'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import BlankSlate from 'connected-components/blank-slates/BlankSlate'
import LoginForm from 'components/login/LoginForm'

const styles = (theme: Theme) =>
  createStyles({
    blankSlate: {
      marginBottom: theme.spacing(8),
    },
    root: {
      color: theme.palette.primary.contrastText,
    },
  })

type StyleProps = WithStyles<typeof styles>

type ComposedProps = StyleProps

const Login: React.FC<ComposedProps> = ({ classes }) => (
  <div className={classes.root}>
    <BlankSlate
      className={classes.blankSlate}
      headline="You are signed out."
      type="signIn"
    />
    <LoginForm />
  </div>
)

export default compose<ComposedProps, {}>(withStyles(styles))(Login)
