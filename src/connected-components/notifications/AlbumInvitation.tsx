import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import UserListItem from 'components/UserListItem'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { NotificationProps } from './'

const useStyles = makeStyles((theme: Theme) => createStyles({}))

interface IDispatchProps {}

interface IStateProps {}

type ComposedProps = NotificationProps & IDispatchProps & IStateProps

function AlbumInvitation({ notification }: ComposedProps) {
  const classes = useStyles()

  return (
    <div>
      <UserListItem
        message={notification.message}
        user={{ username: notification.creator }}
      />
      <Typography component="p" variant="body1">
        Do you want to accept this invitation?
      </Typography>
      <div>
        <Button onClick={() => {}} variant="outlined" size="small">
          Decline
        </Button>
        <Button onClick={() => {}} variant="outlined" size="small">
          Accept
        </Button>
      </div>
    </div>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {}
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  return {}
}

export default compose<ComposedProps, NotificationProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AlbumInvitation)
