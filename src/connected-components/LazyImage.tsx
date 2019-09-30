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

import ImagePreviewGradient from 'components/ImagePreviewGradient'
import Album from 'models/album'
import Image from 'models/image'
import { downloadPreviewImage } from 'store/images/actions'

const styles = (_theme: Theme) =>
  createStyles({
    container: {
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
    },
    image: {
      bottom: '-100%',
      left: '-100%',
      margin: 'auto',
      minHeight: '100%',
      minWidth: '100%',
      position: 'absolute',
      right: '-100%',
      top: '-100%',
    },
    gradient: {
      bottom: 0,
      left: 0,
      opacity: 1,
      position: 'absolute',
      right: 0,
      top: 0,
      transition: 'opacity 1000ms ease-out',
    },
    gradientHidden: {
      opacity: 0,
    },
  })

export interface IProps {
  album: Album
  className?: string
  image: Image
  isVisible: boolean
}

interface IDispatchProps {
  requestDownloadPreviewImage: () => void
  cancelDownloadPreviewImage: () => void
}

interface IStateProps {
  imageObjectURL?: string
  isPreviewLoading?: boolean
}

type ComposedProps = IProps &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

class LazyImage extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    const {
      imageObjectURL,
      isPreviewLoading,
      isVisible,
      requestDownloadPreviewImage,
    } = this.props
    if (isVisible && !isPreviewLoading && imageObjectURL === undefined) {
      requestDownloadPreviewImage()
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const {
      image,
      imageObjectURL,
      isPreviewLoading,
      isVisible,
      requestDownloadPreviewImage,
    } = this.props
    if (
      isVisible &&
      (prevProps.isVisible !== isVisible ||
        prevProps.image._id !== image._id) &&
      !isPreviewLoading &&
      imageObjectURL === undefined
    ) {
      requestDownloadPreviewImage()
    }
  }

  componentWillUnmount() {
    if (this.props.isPreviewLoading === true) {
      this.props.cancelDownloadPreviewImage()
    }
  }

  render() {
    const { classes, className, image, imageObjectURL } = this.props

    const isImageLoaded = imageObjectURL !== undefined

    const imageStyles = {
      opacity: isImageLoaded ? 1 : 0,
    }

    return (
      <div className={cx(classes.container, className)}>
        {isImageLoaded && (
          <img
            alt={image.name}
            className={classes.image}
            src={imageObjectURL}
            style={imageStyles}
          />
        )}

        <ImagePreviewGradient
          colors={image.previewColors}
          className={cx(classes.gradient, {
            [classes.gradientHidden]: isImageLoaded,
          })}
        />
      </div>
    )
  }
}

function mapStateToProps(state: RootState, props: ComposedProps): IStateProps {
  return {
    imageObjectURL: state.images.previewImageObjectURLMap.get(props.image._id),
    isPreviewLoading: !!state.images.previewImageIsLoadingMap.get(
      props.image._id,
    ),
  }
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  const payload = { album: props.album, image: props.image }
  return {
    cancelDownloadPreviewImage: () =>
      dispatch(downloadPreviewImage.cancel(payload)),
    requestDownloadPreviewImage: () =>
      dispatch(downloadPreviewImage.request(payload)),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, ComposedProps, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(LazyImage)
