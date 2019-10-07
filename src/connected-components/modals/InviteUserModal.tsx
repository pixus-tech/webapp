import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import InviteUserForm from 'components/InviteUserForm'
import User from 'models/user'
import { InviteUserModalProps } from 'store/modal/types'
import { selectUsers, searchUsers, inviteUsers } from 'store/sharing/actions'

interface IDispatchProps {
  cancelSearchUsers: typeof searchUsers.cancel
  dispatchInviteUsers: typeof inviteUsers.request
  dispatchSearchUsers: typeof searchUsers.request
  dispatchSelectUsers: typeof selectUsers.request
}

interface IStateProps {
  currentUsername: string | null
  isFetching: boolean
  selectedUsers: User[]
  suggestedUsers: User[]
}

type ComposedProps = InviteUserModalProps & IDispatchProps & IStateProps

function InviteUserModal({
  album,
  cancelSearchUsers,
  currentUsername,
  dispatchSelectUsers,
  dispatchSearchUsers,
  dispatchInviteUsers,
  isFetching,
  selectedUsers,
  suggestedUsers,
}: ComposedProps) {
  const onChangeUsername = (username: string) => {
    if (currentUsername !== null) {
      cancelSearchUsers(currentUsername)
    }

    dispatchSearchUsers(username)
  }

  const debouncedOnChangeUsername = _.debounce(onChangeUsername, 200)

  const onSubmit = (message: string) => {
    if (selectedUsers.length > 0) {
      dispatchInviteUsers({
        album,
        users: selectedUsers,
        message,
      })
    }
  }

  return (
    <>
      <h2 id="modal-title">Invite a user to &ldquo;{album.name}&rdquo;</h2>
      <InviteUserForm
        isFetchingSuggestions={isFetching}
        onChangeSelectedUsers={dispatchSelectUsers}
        onChangeUsername={debouncedOnChangeUsername}
        onSubmit={onSubmit}
        selectedUsers={selectedUsers}
        suggestedUsers={suggestedUsers}
      />
    </>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  const currentUsername = state.sharing.currentUsername
  const isFetching = state.sharing.isSearching
  const selectedUsers = state.sharing.users.toList().toArray()
  const suggestedUsers = state.sharing.suggestedUsers.toList().toArray()

  return {
    currentUsername,
    isFetching,
    selectedUsers,
    suggestedUsers,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    cancelSearchUsers: username => dispatch(searchUsers.cancel(username)),
    dispatchSelectUsers: users => dispatch(selectUsers.request(users)),
    dispatchInviteUsers: payload => dispatch(inviteUsers.request(payload)),
    dispatchSearchUsers: username => dispatch(searchUsers.request(username)),
  }
}

export default compose<ComposedProps, InviteUserModalProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(InviteUserModal)
