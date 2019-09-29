import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Badge from '@material-ui/core/Badge'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import NotificationsIcon from '@material-ui/icons/Notifications'
import NoNotificationsIcon from '@material-ui/icons/NotificationsNone'

import UserListItem from 'components/UserListItem'
import IconWithPopover from 'components/IconWithPopover'
import Notification from 'models/notification'
import { getNotifications } from 'store/notifications/actions'
import { notificationsSelector } from 'store/notifications/selectors'

const styles = (theme: Theme) =>
  createStyles({
    list: {},
    message: {
      padding: theme.spacing(2),
      textAlign: 'center',
    },
  })

interface IProps {}

interface IDispatchProps {
  dispatchGetNotifications: typeof getNotifications.request
}

interface IStateProps {
  notifications: Notification[]
}

type ComposedProps = WithStyles<typeof styles> &
  IProps &
  IDispatchProps &
  IStateProps

class Notifications extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    const { notifications, dispatchGetNotifications } = this.props

    if (notifications.length === 0) {
      dispatchGetNotifications()
    }
  }

  render() {
    const { classes, notifications } = this.props

    const hasNotifications = notifications.length > 0

    return (
      <IconWithPopover
        id="notifications-popover"
        tooltip="Notifications"
        Icon={
          <Badge
            color="secondary"
            badgeContent={notifications.length}
            max={9}
            invisible={!hasNotifications}
          >
            {hasNotifications ? <NotificationsIcon /> : <NoNotificationsIcon />}
          </Badge>
        }
      >
        {hasNotifications ? (
          <List className={classes.list}>
            {_.map(notifications, (notification, index) => (
              <>
                <UserListItem
                  key={`${index}-item`}
                  message={notification.message}
                  user={{ username: notification.creator }}
                />
                {index !== notifications.length - 1 && (
                  <Divider
                    key={`${index}-divider`}
                    variant="inset"
                    component="li"
                  />
                )}
              </>
            ))}
          </List>
        ) : (
          <Typography
            className={classes.message}
            color="inherit"
            variant="body1"
            component="p"
          >
            No unread notifications.
          </Typography>
        )}
      </IconWithPopover>
    )
  }
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    notifications: notificationsSelector(state).toArray(),
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchGetNotifications: () => dispatch(getNotifications.request()),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(Notifications)
