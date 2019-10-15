import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import AppBar from '@material-ui/core/AppBar'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import MenuIcon from '@material-ui/icons/Menu'
import Toolbar from '@material-ui/core/Toolbar'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import IconWithPopover from 'components/IconWithPopover'
import WBM from 'components/ci/WBM'
import UserAvatar from 'components/UserAvatar'
import Notifications from 'connected-components/Notifications'
import UploadInfo from 'connected-components/UploadInfo'
import User from 'models/user'
import { logout } from 'store/auth/actions'
import routes from 'utils/routes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      backgroundColor: theme.palette.primary.main,
      zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
      [theme.breakpoints.up('md')]: {
        minHeight: 60,
      },
    },
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
  onDrawerToggle: () => void
}

type ComposedProps = IDispatchProps & IStateProps & IProps

function Header({ dispatchLogout, onDrawerToggle, user }: ComposedProps) {
  const classes = useStyles()

  return (
    <AppBar
      className={classes.appBar}
      color="primary"
      elevation={3}
      position="static"
    >
      <Container maxWidth="xl">
        <Toolbar
          classes={{
            root: classes.toolbar,
          }}
        >
          <Grid container spacing={1} alignItems="center">
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
            <Hidden xsDown mdUp>
              <Grid item xs />
            </Hidden>
            <Hidden xsDown>
              <Grid item>
                <WBM />
              </Grid>
            </Hidden>
            <Grid item xs />
            <Grid item>
              <UploadInfo />
            </Grid>
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
                  <MenuList>
                    <MenuItem>
                      <Link to={routes.settings} className={classes.link}>
                        Settings
                      </Link>
                    </MenuItem>
                    <MenuItem onClick={dispatchLogout}>Logout</MenuItem>
                  </MenuList>
                </IconWithPopover>
              )}
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
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
)(Header)
