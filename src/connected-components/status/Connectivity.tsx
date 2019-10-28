import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import RefreshIcon from '@material-ui/icons/Autorenew'

import colors from 'constants/colors'
import { probeConnectivity } from 'store/connectivity/actions'
import StatusRow from './StatusRow'

const styles = (theme: Theme) =>
  createStyles({
    bubble: {
      backgroundColor: colors.yellow.main,
      border: `1px solid ${colors.yellow.dark}`,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'inline-block',
      height: 10,
      marginRight: theme.spacing(1),
      width: 10,
    },
    bubbleOnline: {
      backgroundColor: colors.green.main,
      border: `1px solid ${colors.green.dark}`,
    },
    bubbleOffline: {
      backgroundColor: colors.red.main,
      border: `1px solid ${colors.red.dark}`,
    },
    refreshButton: {},
    refreshIcon: {},
  })

interface IProps {}

interface IDispatchProps {
  dispatchProbeConnectivity: typeof probeConnectivity
}

interface IStateProps {
  isBlockstackReachable: boolean | null
  isHubReachable: boolean | null
  isRadiksReachable: boolean | null
}

type ComposedProps = IProps &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

function tooltipMessage(value: boolean | null) {
  if (value === null) {
    return 'is loading'
  }

  return value ? 'is online' : 'is offline'
}

class Connectivity extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    const {
      dispatchProbeConnectivity,
      isBlockstackReachable,
      isHubReachable,
      isRadiksReachable,
    } = this.props

    if (
      isBlockstackReachable === null ||
      isHubReachable === null ||
      isRadiksReachable === null
    ) {
      dispatchProbeConnectivity()
    }
  }

  render() {
    const {
      classes,
      dispatchProbeConnectivity,
      isBlockstackReachable,
      isHubReachable,
      isRadiksReachable,
    } = this.props

    const title = (
      <>
        Connectivity
        <Tooltip title="Click to refresh connectivity status">
          <IconButton
            className={classes.refreshButton}
            onClick={dispatchProbeConnectivity}
          >
            <RefreshIcon className={classes.refreshIcon} />
          </IconButton>
        </Tooltip>
      </>
    )

    return (
      <StatusRow title={title}>
        <Typography color="inherit" variant="body1" component="p">
          <Tooltip title={tooltipMessage(isRadiksReachable)}>
            <span
              className={cx(classes.bubble, {
                [classes.bubbleOnline]: isRadiksReachable === true,
                [classes.bubbleOffline]: isRadiksReachable === false,
              })}
            />
          </Tooltip>
          Pixus database
        </Typography>
        <Typography color="inherit" variant="body1" component="p">
          <Tooltip title={tooltipMessage(isHubReachable)}>
            <span
              className={cx(classes.bubble, {
                [classes.bubbleOnline]: isHubReachable === true,
                [classes.bubbleOffline]: isHubReachable === false,
              })}
            />
          </Tooltip>
          Your Gaia Hub
        </Typography>
        <Typography color="inherit" variant="body1" component="p">
          <Tooltip title={tooltipMessage(isBlockstackReachable)}>
            <span
              className={cx(classes.bubble, {
                [classes.bubbleOnline]: isBlockstackReachable === true,
                [classes.bubbleOffline]: isBlockstackReachable === false,
              })}
            />
          </Tooltip>
          Blockstack Core API
        </Typography>
      </StatusRow>
    )
  }
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isBlockstackReachable: store.connectivity.blockstack,
    isHubReachable: store.connectivity.hub,
    isRadiksReachable: store.connectivity.radiks,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchProbeConnectivity: () => dispatch(probeConnectivity()),
  }
}

export default compose<ComposedProps, IProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(Connectivity)
