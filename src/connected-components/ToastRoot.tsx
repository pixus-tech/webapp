import React from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Snackbar from '@material-ui/core/Snackbar'

import ToastComponent from 'components/Toast'
import { TOAST_SHOW_DURATION } from 'constants/index'
import { hideToast } from 'store/toasts/actions'
import { Toast } from 'store/toasts/types'

interface IDispatchProps {
  dispatchHideToast: (toast?: Toast) => void
}

interface IStateProps {
  currentToast?: Toast
}

type ComposedProps = IDispatchProps & IStateProps

function ToastRoot({ currentToast, dispatchHideToast }: ComposedProps) {
  const isOpen = currentToast !== undefined
  const onClose = dispatchHideToast.bind(undefined, currentToast)

  return ReactDOM.createPortal(
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isOpen}
      autoHideDuration={TOAST_SHOW_DURATION}
      onClose={onClose}
    >
      {currentToast && (
        <ToastComponent
          variant={currentToast.variant}
          message={currentToast.message}
          onClose={onClose}
        />
      )}
    </Snackbar>,
    document.body,
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    currentToast: state.toasts.data.first(),
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchHideToast: toast => {
      if (toast !== undefined) {
        dispatch(hideToast(toast))
      }
    },
  }
}

export default compose<ComposedProps, {}>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ToastRoot)
