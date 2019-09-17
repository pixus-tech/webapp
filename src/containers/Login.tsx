import React from 'react'
import compose from 'recompose/compose'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'

import LoginForm from 'components/LoginForm'

const styles = (theme: Theme) =>
  createStyles({
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
  })

type StyleProps = WithStyles<typeof styles>

type ComposedProps = StyleProps

const Login: React.FC<ComposedProps> = ({ classes }) => (
  <>
    <Avatar className={classes.avatar}>
      <LockOutlinedIcon />
    </Avatar>
    <Typography component="h1" variant="h5">
      Sign in
    </Typography>
    <LoginForm />
  </>
)

export default compose<ComposedProps, {}>(withStyles(styles))(Login)
