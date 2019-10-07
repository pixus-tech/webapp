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
import { downloadImage } from 'store/images/actions'

const styles = (_theme: Theme) =>
  createStyles({
    container: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
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
  requestDownloadImage: () => void
  cancelDownloadImage: () => void
}

interface IStateProps {
  imageObjectURL?: string
  isImageLoading?: boolean
}

type ComposedProps = IProps &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

class LazyImage extends React.PureComponent<ComposedProps> {
  componentDidMount() {
    const {
      imageObjectURL,
      isImageLoading,
      isVisible,
      requestDownloadImage,
    } = this.props
    if (isVisible && !isImageLoading && imageObjectURL === undefined) {
      requestDownloadImage()
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const {
      cancelDownloadImage,
      image,
      imageObjectURL,
      isImageLoading,
      isVisible,
      requestDownloadImage,
    } = this.props
    if (
      isVisible &&
      (prevProps.isVisible !== isVisible ||
        prevProps.image._id !== image._id) &&
      !isImageLoading &&
      imageObjectURL === undefined
    ) {
      requestDownloadImage()
    } else if (!isVisible) {
      cancelDownloadImage()
    }
  }

  componentWillUnmount() {
    if (this.props.isImageLoading === true) {
      this.props.cancelDownloadImage()
    }
  }

  render() {
    const { classes, className, image, imageObjectURL } = this.props

    const isImageLoaded = imageObjectURL !== undefined
    const isHorizontal = image.width > image.height

    const imageStyles = {
      height: isHorizontal ? 'auto' : '100%',
      opacity: isImageLoaded ? 1 : 0,
      width: isHorizontal ? '100%' : 'auto',
    }

    if (isImageLoaded) {
      return <img alt={image.name} src={imageObjectURL} style={imageStyles} />
    }
    return (
      <div className={cx(classes.container, className)}>
        {isImageLoaded && (
          <img alt={image.name} src={imageObjectURL} style={imageStyles} />
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
    imageObjectURL: state.images.imageObjectURLMap.get(props.image._id),
    isImageLoading: !!state.images.imageIsLoadingMap.get(props.image._id),
  }
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  const payload = { album: props.album, image: props.image }
  return {
    cancelDownloadImage: () => dispatch(downloadImage.cancel(payload)),
    requestDownloadImage: () => dispatch(downloadImage.request(payload)),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, ComposedProps, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(LazyImage)
