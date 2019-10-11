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

import ImageActions from 'connected-components/ImageActions'
import ImagePreviewGradient from 'components/ImagePreviewGradient'
import Album from 'models/album'
import Image from 'models/image'
import { downloadPreviewImage } from 'store/images/actions'

const HIDE_GRADIENT_DELAY = 1000

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
  })

export interface IProps {
  album: Album
  className?: string
  image: Image
  showActions?: boolean
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

interface IState {
  shouldRenderGradient: boolean
}

class LazyPreviewImage extends React.PureComponent<ComposedProps, IState> {
  static getDerivedStateFromProps(props: ComposedProps, state: IState) {
    const isImageLoaded = props.imageObjectURL === undefined
    return {
      shouldRenderGradient: isImageLoaded ? state.shouldRenderGradient : true,
    }
  }

  private hideGradientTimeout?: ReturnType<typeof setTimeout>

  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      shouldRenderGradient: true,
    }
  }

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
      cancelDownloadPreviewImage,
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
    } else if (!isVisible) {
      cancelDownloadPreviewImage()
    }

    if (
      prevProps.imageObjectURL === undefined &&
      imageObjectURL !== undefined
    ) {
      this.hideGradientTimeout = setTimeout(
        this.hideGradient,
        HIDE_GRADIENT_DELAY,
      )
    }
  }

  componentWillUnmount() {
    if (this.props.isPreviewLoading === true) {
      this.props.cancelDownloadPreviewImage()
    }

    if (this.hideGradientTimeout !== undefined) {
      clearTimeout(this.hideGradientTimeout)
    }
  }

  hideGradient = () => {
    this.setState({ shouldRenderGradient: false })
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

    const imageStyles = {
      height: isHorizontal ? '100%' : 'auto',
      opacity: isImageLoaded ? 1 : 0,
      width: isHorizontal ? 'auto' : '100%',
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
)(LazyPreviewImage)
