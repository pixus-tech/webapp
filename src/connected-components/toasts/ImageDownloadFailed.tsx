import React from 'react'
import { downloadImage } from 'store/images/actions'

type PayloadType = Parameters<typeof downloadImage.failure>[0]

export default function ImageDownloadFailed({ resource: image }: PayloadType) {
  return <>{image.name} could not be downloaded.</>
}
