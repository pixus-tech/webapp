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
import Tooltip from '@material-ui/core/Tooltip'
import UploadIcon from '@material-ui/icons/CloudUpload'

import ImageActions from 'connected-components/ImageActions'
import ImagePreviewGradient from 'components/ImagePreviewGradient'
import Image from 'models/image'
import {
  downloadPreviewImage,
  requestDownloadPreviewImage,
} from 'store/images/actions'
import { rotation } from 'utils/exif'

const HIDE_GRADIENT_DELAY = 1000

const styles = (theme: Theme) =>
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
      position: 'absolute',
      right: '-100%',
      top: '-100%',
    },
    gradient: {
      bottom: 0,
      left: 0,
      opacity: 1,
      pointerEvents: 'none',
      position: 'absolute',
      right: 0,
      top: 0,
      transition: `opacity ${HIDE_GRADIENT_DELAY}ms ease-out`,
    },
    gradientHidden: {
      opacity: 0,
    },
    actionPanel: {
      opacity: 0,
      transition: `opacity 320ms ease-out`,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.6) 20%, transparent 50%)`,
      '&:hover': {
        opacity: 1,
      },
    },
    uploadIcon: {
      width: 24,
      height: 24,
      bottom: theme.spacing(1) - 3,
      position: 'absolute',
      right: theme.spacing(1),
      animation: `$opacity-pulsate 1250ms ${theme.transitions.easing.easeInOut} 200ms infinite alternate`,
    },
    '@keyframes opacity-pulsate': {
      '0%': {
        opacity: 1,
      },
      '100%': {
        opacity: 0.62,
      },
    },
  })

export interface IProps {
  className?: string
  image: Image
  showActions?: boolean
  isVisible: boolean
}

interface IDispatchProps {
  dispatchRequestDownloadPreviewImage: () => void
  dispatchCancelDownloadPreviewImage: () => void
}

interface IStateProps {
  imageObjectURL?: string
  isPreviewLoading?: boolean
}

type ComposedProps = IProps &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

interface IState {
  shouldRenderGradient: boolean
}

class LazyPreviewImage extends React.PureComponent<ComposedProps, IState> {
  private hideGradientTimeout?: ReturnType<typeof setTimeout>

  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      shouldRenderGradient: props.imageObjectURL === undefined,
    }
  }

  componentDidMount() {
    const {
      imageObjectURL,
      isPreviewLoading,
      isVisible,
      dispatchRequestDownloadPreviewImage,
    } = this.props
    if (isVisible && !isPreviewLoading && imageObjectURL === undefined) {
      dispatchRequestDownloadPreviewImage()
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const {
      dispatchCancelDownloadPreviewImage,
      image,
      imageObjectURL,
      isPreviewLoading,
      isVisible,
      dispatchRequestDownloadPreviewImage,
    } = this.props
    if (
      isVisible &&
      (prevProps.isVisible !== isVisible ||
        prevProps.image._id !== image._id) &&
      !isPreviewLoading &&
      imageObjectURL === undefined
    ) {
      dispatchRequestDownloadPreviewImage()
    } else if (!isVisible && isPreviewLoading) {
      dispatchCancelDownloadPreviewImage()
    }

    if (
      prevProps.imageObjectURL === undefined &&
      imageObjectURL !== undefined
    ) {
      this.hideGradientTimeout = setTimeout(
        this.hideGradient,
        HIDE_GRADIENT_DELAY,
      )
    } else if (
      prevProps.imageObjectURL !== undefined &&
      imageObjectURL === undefined
    ) {
      requestAnimationFrame(this.showGradient)
    }
  }

  componentWillUnmount() {
    if (this.props.isPreviewLoading === true) {
      this.props.dispatchCancelDownloadPreviewImage()
    }

    if (this.hideGradientTimeout !== undefined) {
      clearTimeout(this.hideGradientTimeout)
    }
  }

  hideGradient = () => {
    this.setState({ shouldRenderGradient: false })
  }

  showGradient = () => {
    this.setState({ shouldRenderGradient: true })
  }

  render() {
    const {
      classes,
      className,
      image,
      imageObjectURL,
      showActions,
    } = this.props
    const { shouldRenderGradient } = this.state

    const isImageLoaded = imageObjectURL !== undefined
    const isHorizontal = image.width > image.height
    const isImageDataStored =
      image.meta.isPreviewImageStored && image.meta.isImageStored

    const imageStyles = {
      height: isHorizontal ? '100%' : 'auto',
      opacity: isImageLoaded ? 1 : 0,
      width: isHorizontal ? 'auto' : '100%',
      transform: `rotate(${rotation(image.meta.exifTags)}deg)`,
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

        {shouldRenderGradient && (
          <ImagePreviewGradient
            colors={image.previewColors}
            className={cx(classes.gradient, {
              [classes.gradientHidden]: isImageLoaded,
            })}
          />
        )}

        {showActions && (
          <ImageActions className={classes.actionPanel} image={image} />
        )}

        {!isImageDataStored && (
          <Tooltip title="Upload is pending">
            <UploadIcon className={classes.uploadIcon} />
          </Tooltip>
        )}
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
  const { image } = props
  return {
    dispatchCancelDownloadPreviewImage: () =>
      dispatch(downloadPreviewImage.cancel(image)),
    dispatchRequestDownloadPreviewImage: () =>
      dispatch(requestDownloadPreviewImage(image)),
  }
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, ComposedProps, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(LazyPreviewImage)
