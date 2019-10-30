import React from 'react'
import { IntlProvider } from 'react-intl'
import { connect } from 'react-redux'
import { Router, Redirect, Route, Switch } from 'react-router-dom'
import compose from 'recompose/compose'
import { RootState } from 'typesafe-actions'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import PrivateRoute from 'components/auth/PrivateRoute'
import SigningIn from 'components/auth/SigningIn'
import SignInFailure from 'components/auth/SignInFailure'
import AuthVerifier from 'containers/AuthVerifier'
import Albums from 'containers/Albums'
import Settings from 'containers/Settings'
import ModalRoot from 'connected-components/ModalRoot'
import ToastRoot from 'connected-components/ToastRoot'
import ShowAlbum from 'containers/ShowAlbum'
import ShowSmartAlbum from 'containers/ShowSmartAlbum'
import Login from 'containers/Login'
import AppLayout from 'layouts/App'
import UnauthorizedLayout from 'layouts/Unauthorized'
import authReducer from 'store/auth/reducers'
import { Locales } from 'store/i18n/types'
import history from 'utils/history'
import routes from 'utils/routes'

import localizedMessages from 'translations'

const styles = (theme: Theme) =>
  createStyles({
    '@global': {
      body: {
        backgroundColor: theme.palette.primary.main,
      },
    },
    root: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  })

interface IStateProps {
  auth: ReturnType<typeof authReducer>
  locale: Locales
}

type StyleProps = WithStyles<typeof styles>

type ComposedProps = IStateProps & StyleProps

class App extends React.PureComponent<ComposedProps> {
  render() {
    const { auth, classes, locale } = this.props
    if (!auth && !locale) return null

    return (
      <div className={classes.root}>
        <IntlProvider locale={locale} messages={localizedMessages[locale]}>
          <Router history={history}>
            <AuthVerifier />
            <ModalRoot />
            <ToastRoot />
            <Switch>
              <PrivateRoute
                isAuthenticated={auth.isAuthenticated}
                loginPath={routes.login}
                path={routes.applicationRoot}
                render={_props => (
                  <AppLayout>
                    <Switch>
                      <Route component={ShowAlbum} path={routes.albums} />
                      <Route
                        component={ShowSmartAlbum}
                        path={routes.smartAlbums}
                      />
                      <Route
                        component={Albums}
                        exact
                        path={routes.applicationRoot}
                      />
                      <Route
                        component={Albums}
                        exact
                        path={routes.albumsOverview}
                      />
                      <Route
                        component={Settings}
                        exact
                        path={routes.settings}
                      />
                    </Switch>
                  </AppLayout>
                )}
              />
              <Route
                render={_props => (
                  <UnauthorizedLayout>
                    <Switch>
                      {auth.isAuthenticated && (
                        <Redirect to={{ pathname: routes.applicationRoot }} />
                      )}
                      <Route
                        component={SigningIn}
                        exact
                        path={routes.authVerify}
                      />
                      <Route
                        component={SignInFailure}
                        exact
                        path={routes.signInFailure}
                      />
                      <Route component={Login} path={routes.login} />
                      <Redirect to={{ pathname: routes.login }} />
                    </Switch>
                  </UnauthorizedLayout>
                )}
              />
            </Switch>
          </Router>
        </IntlProvider>
      </div>
    )
  }
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    auth: state.auth,
    locale: state.i18n,
  }
}

export default compose<ComposedProps, {}>(
  connect<IStateProps, undefined, undefined, RootState>(mapStateToProps),
  withStyles(styles),
)(App)
