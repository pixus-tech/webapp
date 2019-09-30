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

import LazyImage from 'connected-components/LazyImage'
import Album from 'models/album'
import Image from 'models/image'

import 'swiper/css/swiper.css'
import Swiper from 'swiper'

const THUMBNAIL_COUNT = 16

const styles = (theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.primary.dark,
      bottom: '0',
      left: '0',
      position: 'fixed',
      right: '0',
      top: '0',
      zIndex: theme.zIndex.modal,
    },
    thumbsContainer: {
      bottom: '0',
      height: 128,
      left: '0',
      position: 'fixed',
      right: '0',
      zIndex: theme.zIndex.modal,
    },
    thumbSlide: {
      width: `${Math.round(100 / THUMBNAIL_COUNT)}%`,
    },
  })

interface IProps {
  album: Album
  images: Image[]
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

type ComposedProps = IProps & WithStyles<typeof styles>

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
      const self = this

      this.thumbsSwiper = new Swiper('.swiper-container-thumbs', {
        spaceBetween: 10,
        slidesPerView: THUMBNAIL_COUNT,
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
      })
    })
  }

  render() {
    const { album, classes } = this.props
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
                <LazyImage album={album} image={slide.image} isVisible />
              </div>
            ))}
          </div>

          <div className="swiper-button-next swiper-button-white" />
          <div className="swiper-button-prev swiper-button-white" />
        </div>
        <div className={cx('swiper-container-thumbs', classes.thumbsContainer)}>
          <div className="swiper-wrapper">
            {virtualThumbsData.slides.map((slide, index) => (
              <div
                className={cx('swiper-slide', classes.thumbSlide)}
                data-swiper-slide-index={slide.index}
                key={index}
                style={{ left: virtualThumbsData.offset }}
              >
                <LazyImage album={album} image={slide.image} isVisible />
              </div>
            ))}
          </div>
        </div>
      </>,
      document.body,
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(Slideshow)
