import cx from 'classnames'
import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import ImagePreviewGradient from './ImagePreviewGradient'
import Image, { imagePreviewUploadPath } from 'models/image'
import { loadFile } from 'utils/blockstack'

export interface IProps {
  height: number
  image: Image
  width: number
}

const useStyles = makeStyles(
  createStyles({
    image: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
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

function LazyImage({ height, image, width }: IProps) {
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

  return (
    <div style={{ height, width }}>
      {imageObject !== undefined && (
        <img
          className={classes.image}
          height={height}
          onLoad={() => setIsImageLoaded(true)}
          src={imageObject}
          style={{ opacity: isImageLoaded ? 1 : 0 }}
          width={width}
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
