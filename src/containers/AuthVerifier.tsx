import { Person } from 'blockstack'
import React from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import { setUser } from 'store/auth/actions'
import authReducer from 'store/auth/reducers'
import { UserData } from 'models/blockstack'
import { User as RadiksUser } from 'radiks'
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
      const radiksUser = RadiksUser.currentUser()
      //await GroupMembership.cacheKeys()
      await radiksUser.save()

      this.setUserData(userSession.loadUserData(), { redirect: false })
    } else if (userSession.isSignInPending()) {
      const userData = await userSession.handlePendingSignIn()
      const radiksUser = await RadiksUser.createWithCurrentUser()
      //await GroupMembership.cacheKeys()
      await radiksUser.save()

      this.setUserData(userData, { redirect: true })
    }
  }

  setUserData(userData: UserData, options: { redirect: boolean }) {
    const person = new Person(userData.profile)
    this.props.dispatchSetUser(person)

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
    dispatchSetUser: (user: Person) => dispatch(setUser(user)),
  }
}

export default compose<ComposedProps, {}>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AuthVerifier)
