import cx from 'classnames'
import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import ImagePreviewGradient from './ImagePreviewGradient'
import Image, { imagePreviewUploadPath } from 'models/image'
import { loadFile } from 'utils/blockstack'

export interface IProps {
  image: Image
}

const useStyles = makeStyles(
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
  }),
)

function LazyImage({ image }: IProps) {
  const classes = useStyles()
  const [imageObject, setImageObject] = React.useState<string | undefined>(
    undefined,
  )
  const [isImageLoaded, setIsImageLoaded] = React.useState<boolean>(false)

  if (imageObject === undefined) {
    setTimeout(() => {
      loadFile(imagePreviewUploadPath(image._id), image.type)
        .then(objectURL => {
          setImageObject(objectURL)
        })
        .catch((error: Error) => console.error('TODO: Error handling'))
    })
  }

  const imageStyles = {
    opacity: isImageLoaded ? 1 : 0,
  }

  return (
    <div className={classes.container}>
      {imageObject !== undefined && (
        <img
          alt={image.name}
          className={classes.image}
          onLoad={() => setIsImageLoaded(true)}
          src={imageObject}
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

export default LazyImage
