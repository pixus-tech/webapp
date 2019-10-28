import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import MenuIcon from '@material-ui/icons/Menu'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import IconWithPopover from 'components/IconWithPopover'
import Header from 'components/Header'
import WBM from 'components/ci/WBM'
import UserAvatar from 'components/UserAvatar'
import Notifications from 'connected-components/Notifications'
import Status from 'connected-components/status'
import User from 'models/user'
import { logout } from 'store/auth/actions'
import routes from 'utils/routes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginLeft: -theme.spacing(1),
    },
    link: {
      color: theme.palette.primary.main,
      outline: 0,
      textDecoration: 'none',
    },
  }),
)

interface IDispatchProps {
  dispatchLogout: typeof logout
}

interface IStateProps {
  user: User | null
}

interface IProps {
  onDrawerToggle?: () => void
}

type ComposedProps = IDispatchProps & IStateProps & IProps

function ApplicationHeader({
  dispatchLogout,
  onDrawerToggle,
  user,
}: ComposedProps) {
  const classes = useStyles()

  return (
    <Header>
      {onDrawerToggle !== undefined && (
        <Hidden mdUp>
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
      )}
      <Hidden xsDown mdUp>
        <Grid item xs />
      </Hidden>
      <Hidden xsDown>
        <Grid item>
          <WBM />
        </Grid>
      </Hidden>
      <Grid item xs />
      {user && (
        <>
          <Grid item>
            <Status />
          </Grid>
          <Grid item>
            <Notifications />
          </Grid>
          <Grid item>
            <IconWithPopover
              id="user-menu-popover"
              tooltip={user.username}
              Icon={<UserAvatar user={user} />}
            >
              <MenuList>
                <MenuItem>
                  <Link to={routes.settings} className={classes.link}>
                    Settings
                  </Link>
                </MenuItem>
                <MenuItem onClick={dispatchLogout}>Logout</MenuItem>
              </MenuList>
            </IconWithPopover>
          </Grid>
        </>
      )}
    </Header>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    user: state.auth.user,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchLogout: () => dispatch(logout()),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ApplicationHeader)
