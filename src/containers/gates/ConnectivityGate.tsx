import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import FullScreenLoader from 'components/FullScreenLoader'
import ConnectivityFailure from 'components/failures/ConnectivityFailure'
import {
  probeConnectivity,
  probeHubConnectivity,
} from 'store/connectivity/actions'

interface IDispatchProps {
  dispatchProbeConnectivity: typeof probeConnectivity
  dispatchProbeHubConnectivity: typeof probeHubConnectivity.request
}

interface IStateProps {
  isAuthenticated: boolean
  isBlockstackReachable: boolean | null
  isHubReachable: boolean | null
  isRadiksReachable: boolean | null
}

type ComposedProps = IDispatchProps & IStateProps

class ConnectivityGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    this.probeConnectivity()
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const { isAuthenticated, dispatchProbeHubConnectivity } = this.props

    if (!prevProps.isAuthenticated && isAuthenticated) {
      dispatchProbeHubConnectivity()
    }
  }

  probeConnectivity = () => {
    this.props.dispatchProbeConnectivity()
  }

  render() {
    const {
      children,
      isAuthenticated,
      isBlockstackReachable,
      isHubReachable,
      isRadiksReachable,
    } = this.props

    const connectivityCheckPending =
      isBlockstackReachable === null ||
      isHubReachable === null ||
      isRadiksReachable === null
    const connectivityCheckFailed =
      isBlockstackReachable === false ||
      (isAuthenticated && isHubReachable === false) ||
      isRadiksReachable === false

    if (connectivityCheckPending || connectivityCheckFailed) {
      return (
        <FullScreenLoader isLoading={connectivityCheckPending}>
          {connectivityCheckFailed && (
            <ConnectivityFailure
              isBlockstackReachable={isBlockstackReachable}
              isHubReachable={isHubReachable}
              isRadiksReachable={isRadiksReachable}
              onRetry={this.probeConnectivity}
            />
          )}
        </FullScreenLoader>
      )
    }

    return children
  }
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isAuthenticated: store.auth.isAuthenticated,
    isBlockstackReachable: store.connectivity.blockstack,
    isHubReachable: store.connectivity.hub,
    isRadiksReachable: store.connectivity.radiks,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchProbeConnectivity: () => dispatch(probeConnectivity()),
    dispatchProbeHubConnectivity: () =>
      dispatch(probeHubConnectivity.request()),
  }
}

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ConnectivityGate)
