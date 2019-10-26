import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/DeleteOutline'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { ConfirmImageDeletionModalProps } from 'store/modal/types'
import { deleteImage } from 'store/images/actions'
import { hideModal } from 'store/modal/actions'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    deleteButton: {
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
        color: theme.palette.common.white,
      },
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
    },
  }),
)

interface IDispatchProps {
  dispatchDeleteImage: () => void
  dispatchHideModal: () => void
}

type ComposedProps = ConfirmImageDeletionModalProps & IDispatchProps

function ConfirmImageDeletionModal({
  image,
  dispatchDeleteImage,
  dispatchHideModal,
}: ComposedProps) {
  const classes = useStyles()

  const imageName = <>&ldquo;{image.name}&rdquo;</>

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h5">
          Confirm deletion
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography component="p" variant="body1">
          Do you really want to delete {imageName}? It will be removed
          permanently and can not be recovered.
        </Typography>
      </Grid>
      <Grid
        container
        item
        xs={12}
        alignItems="flex-end"
        justify="flex-end"
        spacing={1}
      >
        <Grid item xs />
        <Grid item>
          <Button onClick={dispatchHideModal} variant="contained">
            Cancel deletion
          </Button>
        </Grid>
        <Grid item>
          <Button
            className={classes.deleteButton}
            onClick={dispatchDeleteImage}
            startIcon={<DeleteIcon />}
            variant="contained"
          >
            Yes, delete
          </Button>
        </Grid>
      </Grid>
    </Grid>
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
    dispatchHideModal: () => {
      dispatch(hideModal())
    },
  }
}

export default compose<ComposedProps, ConfirmImageDeletionModalProps>(
  connect<undefined, IDispatchProps, ComposedProps, RootState>(
    undefined,
    mapDispatchToProps,
  ),
)(ConfirmImageDeletionModal)
