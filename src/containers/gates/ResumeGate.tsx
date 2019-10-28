import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import { resumePendingUploads } from 'store/images/actions'

interface IDispatchProps {
  dispatchResumePendingUploads: () => void
}

interface IStateProps {
  isAuthenticated: boolean
}

type ComposedProps = IDispatchProps & IStateProps

class ResumeGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.resumeOperations()
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    if (!prevProps.isAuthenticated && this.props.isAuthenticated) {
      this.resumeOperations()
    }
  }

  resumeOperations = () => {
    this.props.dispatchResumePendingUploads()
  }

  render() {
    return this.props.children
  }
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isAuthenticated: store.auth.isAuthenticated,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchResumePendingUploads: () => {
      dispatch(resumePendingUploads())
    },
  }
}

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ResumeGate)
