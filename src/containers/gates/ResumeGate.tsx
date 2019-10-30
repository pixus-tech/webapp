import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import { resumePendingUploads } from 'store/images/actions'
import { loadDatabase, saveDatabase } from 'store/database/actions'

interface IDispatchProps {
  dispatchLoadDatabase: () => void
  dispatchResumePendingUploads: () => void
  dispatchSaveDatabase: () => void
}

interface IStateProps {
  isAuthenticated: boolean
  isDBInitialized: boolean
  dirtyDBRecordCount: number
}

type ComposedProps = IDispatchProps & IStateProps

class ResumeGate extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.resumeOperations()

      if (this.props.isDBInitialized) {
        if (this.props.dirtyDBRecordCount > 0) {
          this.props.dispatchSaveDatabase()
        }
      } else {
        this.props.dispatchLoadDatabase()
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
    isDBInitialized: store.database.isInitialized,
    dirtyDBRecordCount: store.database.dirtyCount,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchLoadDatabase: () => {
      dispatch(loadDatabase.request())
    },
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
