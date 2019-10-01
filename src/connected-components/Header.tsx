import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import AppBar from '@material-ui/core/AppBar'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MenuIcon from '@material-ui/icons/Menu'
import Switch from '@material-ui/core/Switch'
import Toolbar from '@material-ui/core/Toolbar'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import {
  subscribeWebSocket,
  unsubscribeWebSocket,
} from 'store/webSocket/actions'
import IconWithPopover from 'components/IconWithPopover'
import UserAvatar from 'components/UserAvatar'
import Notifications from 'connected-components/Notifications'
import QueueInfo from 'connected-components/QueueInfo'
import User from 'models/user'
import { logout } from 'store/auth/actions'

// TODO: extract color
const lightColor = 'rgba(255, 255, 255, 0.7)'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginLeft: -theme.spacing(1),
    },
    iconButtonAvatar: {
      padding: 4,
    },
    toggle: {
      color: lightColor,
      '&:hover': {
        color: theme.palette.common.white,
      },
    },
  }),
)

interface IDispatchProps {
  dispatchSubscribeWebSocket: typeof subscribeWebSocket
  dispatchUnsubscribeWebSocket: typeof unsubscribeWebSocket
  dispatchLogout: typeof logout
}

interface IStateProps {
  isWebSocketEnabled: boolean
  user: User | null
}

interface IProps {
  onDrawerToggle: () => void
}

type ComposedProps = IDispatchProps & IStateProps & IProps

function Header({
  dispatchLogout,
  dispatchSubscribeWebSocket,
  dispatchUnsubscribeWebSocket,
  isWebSocketEnabled,
  onDrawerToggle,
  user,
}: ComposedProps) {
  const classes = useStyles()

  const toggleWebSocketConnection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.checked) {
      dispatchSubscribeWebSocket()
    } else {
      dispatchUnsubscribeWebSocket()
    }
  }

  return (
    <AppBar color="primary" position="sticky" elevation={0}>
      <Toolbar>
        <Grid container spacing={1} alignItems="center">
          <Hidden smUp>
            <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                className={classes.menuButton}
              >
                <MenuIcon />
              </IconButton>
            </Grid>
          </Hidden>
          <Grid item>
            <QueueInfo />
          </Grid>
          <Hidden mdDown>
            <Grid item>
              <FormControlLabel
                className={classes.toggle}
                control={
                  <Switch
                    checked={isWebSocketEnabled}
                    onChange={toggleWebSocketConnection}
                    value="isWebSocketEnabled"
                    color="secondary"
                  />
                }
                label="Live Editing (Experimental)"
              />
            </Grid>
          </Hidden>
          <Grid item xs />
          <Grid item>
            <Notifications />
          </Grid>
          <Grid item>
            {user && (
              <IconWithPopover
                id="user-menu-popover"
                tooltip={user.username}
                Icon={<UserAvatar user={user} />}
              >
                <List component="nav" aria-label="logout">
                  <ListItem button onClick={dispatchLogout}>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </List>
              </IconWithPopover>
            )}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    isWebSocketEnabled: state.webSocket.isEnabled,
    user: state.auth.user,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchSubscribeWebSocket: () => dispatch(subscribeWebSocket()),
    dispatchUnsubscribeWebSocket: () => dispatch(unsubscribeWebSocket()),
    dispatchLogout: () => dispatch(logout()),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Header)
