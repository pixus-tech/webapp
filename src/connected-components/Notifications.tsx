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

import IconWithPopover from 'components/IconWithPopover'
import Notification from 'models/notification'
import { getNotifications } from 'store/notifications/actions'
import { notificationsSelector } from 'store/notifications/selectors'

import NotificationWrapper from './notifications'

const REFRESH_DELAY = 120 * 1000

const styles = (theme: Theme) =>
  createStyles({
    divider: {
      backgroundColor: theme.palette.grey[300],
      margin: theme.spacing(0, 2),
    },
    list: {
      maxWidth: 368,
      padding: 0,
    },
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
  private refreshInterval?: ReturnType<typeof setInterval>

  componentDidMount() {
    this.getNotifications()
    this.refreshInterval = setInterval(this.getNotifications, REFRESH_DELAY)
  }

  componentWillUnmount() {
    if (this.refreshInterval !== undefined) {
      clearInterval(this.refreshInterval)
    }
  }

  getNotifications = () => {
    this.props.dispatchGetNotifications()
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
            overlap="circle"
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
              <div key={`${index}-item`}>
                <NotificationWrapper notification={notification} />
                {index !== notifications.length - 1 && (
                  <Divider
                    key={`${index}-divider`}
                    className={classes.divider}
                    component="li"
                  />
                )}
              </div>
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
