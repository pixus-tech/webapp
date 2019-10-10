import cx from 'classnames'
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import compose from 'recompose/compose'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/CloseRounded'
import { withTheme, WithTheme } from '@material-ui/core/styles'

import LazyImage from 'connected-components/LazyImage'
import LazyPreviewImage from 'connected-components/LazyPreviewImage'
import Album from 'models/album'
import Image from 'models/image'

import 'swiper/css/swiper.css'
import Swiper from 'swiper'

const styles = (theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.primary.main,
      bottom: 64,
      left: 0,
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: theme.zIndex.modal,
    },
    closeButton: {
      position: 'absolute',
      right: 10, // Swiperjs specific value
      top: 10, // Swiperjs specific value
      zIndex: 10, // Swiperjs specific value
    },
    closeIcon: {
      color: 'white',
      height: 44,
      width: 44,
    },
    thumbsContainer: {
      bottom: 0,
      height: 64,
      padding: theme.spacing(1, 0),
      left: 0,
      position: 'fixed',
      right: 0,
      zIndex: theme.zIndex.modal,
      backgroundColor: theme.palette.primary.main,
      display: 'flex',
      justifyContent: 'center',
    },
    thumbsContent: {
      maxWidth: 1024,
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '" "',
        display: 'block',
        position: 'absolute',
        zIndex: 11, // Swiperjs specific value
        bottom: 0,
        left: 0,
        top: 0,
        right: '90%',
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(to left, rgba(40,40,40,0), rgba(40,40,40,1))',
      },
      '&::before': {
        content: '" "',
        display: 'block',
        position: 'absolute',
        zIndex: 11, // Swiperjs specific value
        bottom: 0,
        left: '90%',
        top: 0,
        right: 0,
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(to right, rgba(40,40,40,0), rgba(40,40,40,1))',
      },
    },
    thumbSlide: {
      height: 48,
    },
  })

interface IProps {
  album: Album
  images: Image[]
  initialSlide: number
  onClose: () => void
}

interface ImageSlide {
  image: Image
  index: number
}

interface IState {
  slides: ImageSlide[]
  virtualData: { offset?: number; slides: ImageSlide[] }
  virtualThumbsData: { offset?: number; slides: ImageSlide[] }
}

type ComposedProps = IProps & WithStyles<typeof styles> & WithTheme

class Slideshow extends React.PureComponent<ComposedProps, IState> {
  private swiper?: Swiper
  private thumbsSwiper?: Swiper

  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      slides: _.map(props.images, (image, index) => ({ image, index })),
      virtualData: {
        slides: [],
      },
      virtualThumbsData: {
        slides: [],
      },
    }
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      const { initialSlide, theme } = this.props
      const self = this

      this.thumbsSwiper = new Swiper('.swiper-container-thumbs', {
        initialSlide,
        slidesPerView: 10,
        spaceBetween: theme.spacing(1),
        breakpoints: {
          // when window width is >= md breakpoint
          [theme.breakpoints.width('md')]: {
            slidesPerView: 17,
          },
        },
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        slideToClickedSlide: true,
        centeredSlides: true,
        virtual: {
          slides: self.state.slides,
          renderExternal(data) {
            self.setState({
              virtualThumbsData: data,
            })
          },
        },
      })

      this.swiper = new Swiper('.swiper-container', {
        initialSlide,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        thumbs: {
          swiper: this.thumbsSwiper,
        },
        virtual: {
          slides: self.state.slides,
          renderExternal(data) {
            self.setState({
              virtualData: data,
            })
          },
        },
        zoom: true,
      })
    })
  }

  render() {
    const { album, classes, onClose } = this.props
    const { virtualData, virtualThumbsData } = this.state

    return ReactDOM.createPortal(
      <>
        <div className={cx('swiper-container', classes.container)}>
          <div className="swiper-wrapper">
            {virtualData.slides.map((slide, index) => (
              <div
                className="swiper-slide"
                data-swiper-slide-index={slide.index}
                key={index}
                style={{ left: virtualData.offset }}
              >
                <div className="swiper-zoom-container">
                  <LazyImage album={album} image={slide.image} isVisible />
                </div>
              </div>
            ))}
          </div>

          <div className="swiper-button-next swiper-button-white" />
          <div className="swiper-button-prev swiper-button-white" />
          <IconButton className={classes.closeButton} onClick={onClose}>
            <CloseIcon className={classes.closeIcon} />
          </IconButton>
        </div>
        <div className={classes.thumbsContainer}>
          <div className={cx('swiper-container-thumbs', classes.thumbsContent)}>
            <div className="swiper-wrapper">
              {virtualThumbsData.slides.map((slide, index) => (
                <div
                  className={cx('swiper-slide', classes.thumbSlide)}
                  data-swiper-slide-index={slide.index}
                  key={index}
                  style={{ left: virtualThumbsData.offset }}
                >
                  <LazyPreviewImage
                    album={album}
                    image={slide.image}
                    isVisible
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>,
      document.body,
    )
  }
}

export default compose<ComposedProps, IProps>(
  withStyles(styles),
  withTheme,
)(Slideshow)
