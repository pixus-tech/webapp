import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/DeleteOutline'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { ConfirmImageDeletionModalProps } from 'store/modal/types'
import { deleteImage } from 'store/images/actions'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteButton: {
      backgroundColor: theme.palette.error.main,
    },
  }),
)

interface IDispatchProps {
  dispatchDeleteImage: () => void
}

type ComposedProps = ConfirmImageDeletionModalProps & IDispatchProps

function ConfirmImageDeletionModal({
  image,
  dispatchDeleteImage,
}: ComposedProps) {
  const classes = useStyles()

  return (
    <>
      <h2 id="modal-title">Invite a user to &ldquo;{image.name}&rdquo;</h2>
      <Button
        className={classes.deleteButton}
        onClick={dispatchDeleteImage}
        startIcon={<DeleteIcon />}
        variant="contained"
      >
        Delete
      </Button>
    </>
  )
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  return {
    dispatchDeleteImage: () => {
      dispatch(deleteImage.request(props.image))
    },
  }
}

export default compose<ComposedProps, ConfirmImageDeletionModalProps>(
  connect<undefined, IDispatchProps, ComposedProps, RootState>(
    undefined,
    mapDispatchToProps,
  ),
)(ConfirmImageDeletionModal)
