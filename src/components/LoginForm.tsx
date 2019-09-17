import React from 'react'
import compose from 'recompose/compose'
import Button from '@material-ui/core/Button'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import userSession from 'utils/userSession'

const styles = (theme: Theme) =>
  createStyles({
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  })

type StyleProps = WithStyles<typeof styles>

interface IProps {}

type ComposedProps = StyleProps & IProps

const LoginForm: React.FC<ComposedProps> = ({ classes }) => (
  <Button
    className={classes.submit}
    color="primary"
    fullWidth
    type="submit"
    variant="contained"
    onClick={() => userSession.redirectToSignIn()}
  >
    Sign in with Blockstack
  </Button>
)

export default compose<ComposedProps, IProps>(withStyles(styles))(LoginForm)
