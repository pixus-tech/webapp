import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import { loadSettings } from 'store/settings/actions'

interface IDispatchProps {
  dispatchLoadSettings: typeof loadSettings.request
}

interface IStateProps {
  isAuthenticated: boolean
}

type ComposedProps = IDispatchProps & IStateProps

class SettingsGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.loadSettings()
    }
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
    const { children, isAuthenticated } = this.props

    if (!isAuthenticated) {
      return children
    }

    return children
  }
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isAuthenticated: store.auth.isAuthenticated,
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
)(SettingsGate)
