import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Fade from 'components/Fade'
import { hideModal } from 'store/modal/actions'
import { ModalType, ModalProps } from 'store/modal/types'

import InviteUserModal from 'connected-components/modals/InviteUserModal'

const MODAL_COMPONENTS = {
  [ModalType.InviteUser]: InviteUserModal,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }),
)

interface IDispatchProps {
  dispatchHideModal: typeof hideModal
}

interface IStateProps {
  modalType: null | ModalType
  modalProps: null | ModalProps
}

type ComposedProps = IDispatchProps & IStateProps

function ModalRoot({
  dispatchHideModal,
  modalType,
  modalProps,
}: ComposedProps) {
  const classes = useStyles()
  const isOpen = modalType !== null && modalProps !== null
  const SpecificModal = modalType !== null ? MODAL_COMPONENTS[modalType] : null

  return (
    <Modal
      aria-labelledby="modal-title"
      className={classes.modal}
      open={isOpen}
      onClose={dispatchHideModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        {isOpen && SpecificModal !== null && modalProps !== null ? (
          <div className={classes.paper}>
            <SpecificModal {...modalProps} />
          </div>
        ) : (
          <div />
        )}
      </Fade>
    </Modal>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    modalType: state.modal.type,
    modalProps: state.modal.props,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchHideModal: () => dispatch(hideModal()),
  }
}

export default compose<ComposedProps, {}>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ModalRoot)
