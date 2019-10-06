import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { PersistGate } from 'redux-persist/integration/react'
import { RootAction, RootState } from 'typesafe-actions'

import FullScreenLoader from 'components/FullScreenLoader'
import ConnectivityFailure from 'components/ConnectivityFailure'
import { probeConnectivity } from 'store/connectivity/actions'
import storeConfiguration from 'store'

interface IDispatchProps {
  dispatchProbeConnectivity: typeof probeConnectivity
}

interface IStateProps {
  isBlockstackReachable: boolean | null
  isHubReachable: boolean | null
  isRadiksReachable: boolean | null
}

type ComposedProps = IDispatchProps & IStateProps

class InitializationGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    this.probeConnectivity()
  }

  probeConnectivity = () => {
    this.props.dispatchProbeConnectivity()
  }

  render() {
    const {
      children,
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
      isHubReachable === false ||
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

    return (
      <PersistGate
        loading={<FullScreenLoader isLoading />}
        persistor={storeConfiguration.persistor}
      >
        {children}
      </PersistGate>
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

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(InitializationGate)
