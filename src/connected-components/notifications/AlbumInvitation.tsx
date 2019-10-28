import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import UserAvatar from 'components/UserAvatar'
import colors from 'constants/colors'

import { NotificationProps } from './'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(0.5, 2),
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      margin: theme.spacing(1, 0, 0, 0),
    },
    accept: {
      color: colors.green.main,
      borderColor: colors.green.main,
      marginLeft: theme.spacing(1),
      '&:hover': {
        color: colors.green.dark,
        borderColor: colors.green.dark,
      },
    },
    decline: {
      color: colors.red.main,
      borderColor: colors.red.main,
      '&:hover': {
        color: colors.red.dark,
        borderColor: colors.red.dark,
      },
    },
  }),
)

interface IDispatchProps {}

interface IStateProps {}

type ComposedProps = NotificationProps & IDispatchProps & IStateProps

function AlbumInvitation({ notification }: ComposedProps) {
  const classes = useStyles()

  return (
    <ListItem className={classes.root} component="li" alignItems="flex-start">
      <ListItemAvatar>
        <UserAvatar user={{ username: notification.creator }} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <span>
            Invite from {notification.creator}
          </span>
        }
        secondary={
          <>
            <Typography component="span" variant="body1">
              {notification.message}
            </Typography>
            <span className={classes.actions}>
              <Button
                className={classes.decline}
                onClick={() => {}}
                variant="outlined"
                size="small"
              >
                Decline
              </Button>
              <Button
                className={classes.accept}
                onClick={() => {}}
                variant="outlined"
                size="small"
              >
                Accept
              </Button>
            </span>
          </>
        }
      />
    </ListItem>
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
