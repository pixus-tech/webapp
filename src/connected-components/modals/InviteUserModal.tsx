import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import InviteUserForm from 'components/InviteUserForm'
import User from 'models/user'
import { InviteUserModalProps } from 'store/modal/types'
import { searchUsers, inviteUser } from 'store/sharing/actions'

interface IDispatchProps {
  cancelSearchUsers: typeof searchUsers.cancel
  dispatchInviteUser: typeof inviteUser.request
  dispatchSearchUsers: typeof searchUsers.request
}

interface IStateProps {
  currentUser?: User | null
  currentUsername: string | null
  isFetching: boolean
  suggestions: User[]
}

type ComposedProps = InviteUserModalProps & IDispatchProps & IStateProps

function InviteUserModal({
  album,
  cancelSearchUsers,
  currentUser,
  currentUsername,
  dispatchSearchUsers,
  dispatchInviteUser,
  isFetching,
  suggestions,
}: ComposedProps) {
  const onChangeUsername = (username: string) => {
    if (currentUsername !== null) {
      cancelSearchUsers(currentUsername)
    }

    dispatchSearchUsers(username)
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
      {suggestions.map(s => <div key={s.username}>{s.username}</div>)}
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
  const suggestions = state.sharing.suggestions.toArray()

  return {
    currentUser,
    currentUsername,
    suggestions,
    isFetching,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    cancelSearchUsers: username => dispatch(searchUsers.cancel(username)),
    dispatchInviteUser: payload => dispatch(inviteUser.request(payload)),
    dispatchSearchUsers: username => dispatch(searchUsers.request(username)),
  }
}

export default compose<ComposedProps, InviteUserModalProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(InviteUserModal)
