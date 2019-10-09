import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import FullScreenLoader from 'components/FullScreenLoader'
import SettingsFailure from 'components/failures/SettingsFailure'
import { loadSettings } from 'store/settings/actions'

interface IDispatchProps {
  dispatchLoadSettings: typeof loadSettings.request
}

interface IStateProps {
  isAuthenticated: boolean
  isFailed: boolean
  isLoaded: boolean
  isLoading: boolean
}

type ComposedProps = IDispatchProps & IStateProps

class ConnectivityGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    this.loadSettings()
  }

  componentDidUpdate(prevProps: ComposedProps) {
    if (!prevProps.isAuthenticated && this.props.isAuthenticated) {
      this.loadSettings()
    }
  }

  loadSettings = () => {
    this.props.dispatchLoadSettings()
  }

  render() {
    const { children, isFailed, isLoaded, isLoading } = this.props

    if (!isLoaded || isFailed) {
      return (
        <FullScreenLoader isLoading={isLoading}>
          {isFailed && <SettingsFailure onRetry={this.loadSettings} />}
        </FullScreenLoader>
      )
    }

    return children
  }
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isAuthenticated: store.auth.isAuthenticated,
    isFailed: store.settings.loadingDidFail,
    isLoaded: store.settings.isLoaded,
    isLoading: store.settings.isLoading,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchLoadSettings: () => dispatch(loadSettings.request()),
  }
}

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ConnectivityGate)
