import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import AppBar from '@material-ui/core/AppBar'
import Avatar from '@material-ui/core/Avatar'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import NotificationsIcon from '@material-ui/icons/Notifications'
import Switch from '@material-ui/core/Switch'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import {
  subscribeWebSocket,
  unsubscribeWebSocket,
} from 'store/webSocket/actions'

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
}

interface IStateProps {
  isWebSocketEnabled: boolean
}

interface IProps {
  onDrawerToggle: () => void
}

type ComposedProps = IDispatchProps & IStateProps & IProps

function Header({
  dispatchSubscribeWebSocket,
  dispatchUnsubscribeWebSocket,
  isWebSocketEnabled,
  onDrawerToggle,
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
            <Tooltip title="Alerts • No alters">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item>
            <IconButton color="inherit" className={classes.iconButtonAvatar}>
              <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    isWebSocketEnabled: state.webSocket.isEnabled,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchSubscribeWebSocket: () => dispatch(subscribeWebSocket()),
    dispatchUnsubscribeWebSocket: () => dispatch(unsubscribeWebSocket()),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Header)
