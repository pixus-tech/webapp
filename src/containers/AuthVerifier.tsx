import React from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import { setUser } from 'store/auth/actions'
import authReducer from 'store/auth/reducers'
import { UserData } from 'models/blockstack'
import { GroupMembership, User as RadiksUser } from 'radiks'
import routes, { redirect } from 'utils/routes'
import userSession from 'utils/userSession'

interface IStateProps {
  auth: ReturnType<typeof authReducer>
}

interface IDispatchProps {
  dispatchSetUser: typeof setUser
}

type ComposedProps = IStateProps & IDispatchProps

class AuthVerifier extends React.Component<ComposedProps> {
  componentDidMount() {
    this.login()
  }

  async login() {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      await RadiksUser.createWithCurrentUser()
      await GroupMembership.cacheKeys()
      this.setUserData(userData, { redirect: false })
    } else if (userSession.isSignInPending()) {
      const userData = await userSession.handlePendingSignIn()
      const radiksUser = await RadiksUser.createWithCurrentUser()
      await radiksUser.save()

      this.setUserData(userData, { redirect: true })
    }
  }

  setUserData(userData: UserData, options: { redirect: boolean }) {
    this.props.dispatchSetUser(userData)

    if (options.redirect) {
      redirect(routes.applicationRoot)
    }
  }

  render() {
    return null
  }
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    auth: state.auth,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchSetUser: userData => dispatch(setUser(userData)),
  }
}

export default compose<ComposedProps, {}>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AuthVerifier)
