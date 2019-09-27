import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import InviteUserForm from 'components/InviteUserForm'
import User from 'models/user'
import { InviteUserModalProps } from 'store/modal/types'
import { findUser, inviteUser } from 'store/sharing/actions'

interface IDispatchProps {
  cancelFindUser: typeof findUser.cancel
  dispatchInviteUser: typeof inviteUser.request
  dispatchFindUser: typeof findUser.request
}

interface IStateProps {
  currentUser?: User | null
  currentUsername: string | null
  isFetching: boolean
}

type ComposedProps = InviteUserModalProps & IDispatchProps & IStateProps

function InviteUserModal({
  album,
  cancelFindUser,
  currentUser,
  currentUsername,
  dispatchFindUser,
  dispatchInviteUser,
  isFetching,
}: ComposedProps) {
  const onChangeUsername = (username: string) => {
    if (currentUsername !== null) {
      cancelFindUser(currentUsername)
    }

    dispatchFindUser(username)
  }

  const onSubmit = (message: string) => {
    if (currentUser) {
      dispatchInviteUser({
        album,
        user: currentUser,
        message,
      })
    }
  }

  return (
    <>
      <h2 id="modal-title">Invite a user to "{album.name}"</h2>
      <InviteUserForm
        onSubmit={onSubmit}
        onChangeUsername={onChangeUsername}
        isFetchingUser={isFetching}
        user={currentUser}
      />
    </>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  const currentUsername = state.sharing.currentUsername
  const isFetching = currentUsername
    ? state.sharing.isFetching.get(currentUsername) || false
    : false
  const currentUser = currentUsername
    ? state.sharing.users.get(currentUsername)
    : undefined

  return {
    currentUser,
    currentUsername,
    isFetching,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    cancelFindUser: username => dispatch(findUser.cancel(username)),
    dispatchInviteUser: payload => dispatch(inviteUser.request(payload)),
    dispatchFindUser: username => dispatch(findUser.request(username)),
  }
}

export default compose<ComposedProps, InviteUserModalProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(InviteUserModal)
