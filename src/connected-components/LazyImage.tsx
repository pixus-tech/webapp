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

import LazyPreviewImage from './LazyPreviewImage'
import Image from 'models/image'
import { requestDownloadImage, downloadImage } from 'store/images/actions'

const HIDE_PREVIEW_DELAY = 1000

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
    preview: {
      bottom: 0,
      left: 0,
      opacity: 1,
      position: 'absolute',
      right: 0,
      top: 0,
      transition: `opacity ${HIDE_PREVIEW_DELAY}ms ease-out`,
    },
    previewHidden: {
      opacity: 0,
    },
  })

export interface IProps {
  className?: string
  image: Image
  isVisible: boolean
}

interface IDispatchProps {
  dispatchRequestDownloadImage: () => void
  dispatchCancelDownloadImage: () => void
}

interface IStateProps {
  imageObjectURL?: string
  isImageLoading?: boolean
}

type ComposedProps = IProps &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

interface IState {
  shouldRenderPreview: boolean
}

class LazyImage extends React.PureComponent<ComposedProps, IState> {
  private hidePreviewTimeout?: ReturnType<typeof setTimeout>

  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      shouldRenderPreview: props.imageObjectURL === undefined,
    }
  }

  componentDidMount() {
    const {
      imageObjectURL,
      isImageLoading,
      isVisible,
      dispatchRequestDownloadImage,
    } = this.props
    if (isVisible && !isImageLoading && imageObjectURL === undefined) {
      dispatchRequestDownloadImage()
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const {
      dispatchCancelDownloadImage,
      image,
      imageObjectURL,
      isImageLoading,
      isVisible,
      dispatchRequestDownloadImage,
    } = this.props
    if (
      isVisible &&
      (prevProps.isVisible !== isVisible ||
        prevProps.image._id !== image._id) &&
      !isImageLoading &&
      imageObjectURL === undefined
    ) {
      dispatchRequestDownloadImage()
    } else if (!isVisible) {
      dispatchCancelDownloadImage()
    }

    if (
      prevProps.imageObjectURL === undefined &&
      imageObjectURL !== undefined
    ) {
      this.hidePreviewTimeout = setTimeout(this.hidePreview, HIDE_PREVIEW_DELAY)
    } else if (
      prevProps.imageObjectURL !== undefined &&
      imageObjectURL === undefined
    ) {
      requestAnimationFrame(this.showPreview)
    }
  }

  componentWillUnmount() {
    if (this.props.isImageLoading === true) {
      this.props.dispatchCancelDownloadImage()
    }

    if (this.hidePreviewTimeout !== undefined) {
      clearTimeout(this.hidePreviewTimeout)
    }
  }

  hidePreview = () => {
    this.setState({ shouldRenderPreview: false })
  }

  showPreview = () => {
    this.setState({ shouldRenderPreview: true })
  }

  render() {
    const { classes, className, image, imageObjectURL, isVisible } = this.props
    const { shouldRenderPreview } = this.state

    const isImageLoaded = imageObjectURL !== undefined
    const isHorizontal = image.width > image.height

    const imageStyles = {
      height: isHorizontal ? 'auto' : '100%',
      opacity: isImageLoaded ? 1 : 0,
      width: isHorizontal ? '100%' : 'auto',
    }

    if (!shouldRenderPreview && isImageLoaded) {
      return <img alt={image.name} src={imageObjectURL} style={imageStyles} />
    }

    return (
      <div className={cx(classes.container, className)}>
        {isImageLoaded && (
          <img alt={image.name} src={imageObjectURL} style={imageStyles} />
        )}

        {shouldRenderPreview && (
          <LazyPreviewImage
            image={image}
            isVisible={isVisible}
            className={cx(classes.preview, {
              [classes.previewHidden]: isImageLoaded,
            })}
          />
        )}
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
  const { image } = props
  return {
    dispatchCancelDownloadImage: () => dispatch(downloadImage.cancel(image)),
    dispatchRequestDownloadImage: () => dispatch(requestDownloadImage(image)),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, ComposedProps, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(LazyImage)
