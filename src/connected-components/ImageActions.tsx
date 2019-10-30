import cx from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import Image from 'models/image'

import CircularProgress from '@material-ui/core/CircularProgress'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/DeleteOutline'
import DownloadIcon from '@material-ui/icons/SaveAlt'
import FilledStarIcon from '@material-ui/icons/Star'
import EmptyStarIcon from '@material-ui/icons/StarBorder'

import { saveImage, toggleImageFavorite } from 'store/images/actions'
import { showModal } from 'store/modal/actions'
import { ModalType } from 'store/modal/types'
import { currentUsername } from 'utils/blockstack'
import { preventClickThrough } from 'utils/ui'

const styles = (theme: Theme) =>
  createStyles({
    container: {
      alignItems: 'flex-start',
      display: 'flex',
      justifyContent: 'flex-end',
      padding: theme.spacing(1),
    },
    button: {
      color: theme.palette.common.white,
    },
    progressWrapper: {
      alignItems: 'center',
      backgroundColor: 'rgba(28,28,30,0.6)',
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
      justifyContent: 'center',
      width: '100%',
    },
  })

export interface IProps {
  className?: string
  image: Image
}

interface IDispatchProps {
  dispatchSaveImage: () => void
  dispatchToggleFavorite: () => void
  requestImageDeletion: () => void
}

interface IStateProps {
  isLoading: boolean
}

type ComposedProps = IProps &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

class ImageActions extends React.PureComponent<ComposedProps> {
  requestImageDownload = (event: React.MouseEvent<HTMLElement>) => {
    preventClickThrough(event)
    this.props.dispatchSaveImage()
  }

  requestImageDeletion = (event: React.MouseEvent<HTMLElement>) => {
    preventClickThrough(event)
    this.props.requestImageDeletion()
  }

  toggleFavorite = (event: React.MouseEvent<HTMLElement>) => {
    preventClickThrough(event)
    this.props.dispatchToggleFavorite()
  }

  render() {
    const { classes, className, isLoading, image } = this.props
    const { isFavorite } = image.meta

    if (isLoading) {
      return (
        <div className={cx(classes.progressWrapper, className)}>
          <CircularProgress color="secondary" size={32} />
        </div>
      )
    }

    const FavoriteIcon = isFavorite ? FilledStarIcon : EmptyStarIcon

    return (
      <div className={cx(classes.container, className)}>
        {image.username === currentUsername() && (
          <Tooltip title="Permanently delete file">
            <IconButton
              className={classes.button}
              color="secondary"
              onClick={this.requestImageDeletion}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Download decrypted file to your computer">
          <IconButton
            className={classes.button}
            color="secondary"
            onClick={this.requestImageDownload}
            aria-label="download"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add to your favorites">
          <IconButton
            className={classes.button}
            color="secondary"
            onClick={this.toggleFavorite}
            aria-label={
              isFavorite ? 'remove from favorites' : 'add to favorites'
            }
          >
            <FavoriteIcon />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}

function mapStateToProps(state: RootState, props: ComposedProps): IStateProps {
  return {
    isLoading: !!state.images.imageIsLoadingMap.get(props.image._id),
  }
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  const { image } = props

  return {
    dispatchSaveImage: () => {
      dispatch(saveImage.request(image))
    },
    dispatchToggleFavorite: () => {
      dispatch(toggleImageFavorite(image))
    },
    requestImageDeletion: () => {
      dispatch(
        showModal({ type: ModalType.ConfirmImageDeletion, props: { image } }),
      )
    },
  }
}

export default compose<ComposedProps, IProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(ImageActions)
