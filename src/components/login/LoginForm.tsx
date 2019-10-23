import React from 'react'
import compose from 'recompose/compose'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import userSession from 'services/userSession'
import SignInButton from './SignInButton'

const styles = (theme: Theme) =>
  createStyles({
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })

type StyleProps = WithStyles<typeof styles>

interface IProps {}

type ComposedProps = StyleProps & IProps

function redirectToSignIn() {
  userSession.redirectToSignIn()
}

const LoginForm: React.FC<ComposedProps> = ({ classes }) => (
  <SignInButton className={classes.submit} onClick={redirectToSignIn} />
)

export default compose<ComposedProps, IProps>(withStyles(styles))(LoginForm)
