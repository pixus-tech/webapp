import { Observable } from 'rxjs'

import { IMAGE_PREVIEW_SIZE } from 'constants/index'
import Album from 'models/album'
import Image, { ImageMetaData, parseImageRecords } from 'models/image'
import { Uint8BitColor } from 'utils/colors'
import ImageRecord from 'db/image'

export const getAlbumImages = (album: Album) => {
  return new Observable<Image[]>(subscriber => {
    ImageRecord.fetchOwnList<ImageRecord>({
      albumIds: album._id,
    })
      .then((imageRecords: ImageRecord[]) => {
        const images = parseImageRecords(imageRecords)
        subscriber.next(images)
        subscriber.complete()
      })
      .catch((error: string) => {
        console.log('query error', error)
        subscriber.error(error)
      })
  })
}

export function processImage(imageObjectURL: string) {
  return new Observable<ImageMetaData>(subscriber => {
    const img = new window.Image()

    img.onerror = function(error) {
      subscriber.error(`Image could not be loaded: ${error}`)
    }

    img.onload = function() {
      URL.revokeObjectURL(img.src) // TODO: should we really revoke it here?

      const canvas = document.createElement('canvas')
      const previewBounds = {
        height:
          img.height < img.width
            ? Math.round((IMAGE_PREVIEW_SIZE / img.width) * img.height)
            : IMAGE_PREVIEW_SIZE,
        width:
          img.height < img.width
            ? IMAGE_PREVIEW_SIZE
            : Math.round((IMAGE_PREVIEW_SIZE / img.height) * img.width),
      }
      canvas.width = previewBounds.width
      canvas.height = previewBounds.height

      const ctx = canvas.getContext('2d')
      if (ctx === null) {
        subscriber.error('Could not generade context 2d for image preview.')
      } else {
        ctx.drawImage(img, 0, 0, previewBounds.width, previewBounds.height)

        const bl = ctx.getImageData(0, previewBounds.height - 1, 1, 1).data
        const br = ctx.getImageData(
          previewBounds.width - 1,
          previewBounds.height - 1,
          1,
          1,
        ).data
        const c = ctx.getImageData(
          Math.floor(previewBounds.width / 2),
          Math.floor(previewBounds.height / 2),
          1,
          1,
        ).data
        const tl = ctx.getImageData(0, 0, 1, 1).data
        const tr = ctx.getImageData(previewBounds.width - 1, 0, 1, 1).data

        canvas.toBlob(
          blob => {
            if (blob === null) {
              subscriber.error('Could not get image blob from canvas.')
            } else {
              const response = new Response(blob)
              response
                .arrayBuffer()
                .then(previewImageData => {
                  const imageMetaData: ImageMetaData = {
                    height: img.height,
                    previewColors: {
                      bl: Array.from(bl).slice(0, 3) as Uint8BitColor,
                      br: Array.from(br).slice(0, 3) as Uint8BitColor,
                      c: Array.from(c).slice(0, 3) as Uint8BitColor,
                      tl: Array.from(tl).slice(0, 3) as Uint8BitColor,
                      tr: Array.from(tr).slice(0, 3) as Uint8BitColor,
                    },
                    previewImageData,
                    width: img.width,
                  }
                  subscriber.next(imageMetaData)
                  subscriber.complete()
                })
                .catch(error =>
                  subscriber.error('Could not get image blob from canvas.'),
                )
            }
          },
          'image/jpeg',
          0.9,
        )
      }
    }

    img.src = imageObjectURL
  })
}
