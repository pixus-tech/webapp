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
    image: {
      height: 'auto',
      position: 'absolute',
      width: '100%',
    },
    gradient: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 1,
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

  return (
    <>
      {imageObject !== undefined && (
        <img
          className={classes.image}
          src={imageObject}
          onLoad={() => setIsImageLoaded(true)}
          style={{ opacity: isImageLoaded ? 1 : 0 }}
        />
      )}

      <ImagePreviewGradient
        colors={image.previewColors}
        className={cx(classes.gradient, {
          [classes.gradientHidden]: isImageLoaded,
        })}
      />
    </>
  )
}

export default LazyImage
