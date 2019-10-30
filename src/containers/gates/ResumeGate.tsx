import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import { resumePendingUploads } from 'store/images/actions'
import { saveDatabase } from 'store/database/actions'

interface IDispatchProps {
  dispatchResumePendingUploads: () => void
  dispatchSaveDatabase: () => void
}

interface IStateProps {
  isAuthenticated: boolean
  dirtyDBRecordCount: number
}

type ComposedProps = IDispatchProps & IStateProps

class ResumeGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.resumeOperations()

      if (this.props.dirtyDBRecordCount > 0) {
        this.props.dispatchSaveDatabase()
      }
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
    dirtyDBRecordCount: store.database.dirtyCount,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchResumePendingUploads: () => {
      dispatch(resumePendingUploads())
    },
    dispatchSaveDatabase: () => {
      dispatch(saveDatabase.request())
    },
  }
}

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ResumeGate)
