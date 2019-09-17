import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import uuid from 'uuid/v4'
import toArrayBuffer from 'to-arraybuffer'

import userSession from 'utils/userSession'
import { IMAGE_PREVIEW_SIZE } from 'constants/index'
import Image, { ImagePreview, parseImageRecords } from 'models/image'
import { Uint8BitColor } from 'utils/colors'
import ImageRecord, { ImageRecordFactory } from 'db/image'

export const getImages = () => {
  return from(ImageRecord.fetchOwnList<ImageRecord>()).pipe(
    map((imageRecords: ImageRecord[]) => {
      return parseImageRecords(imageRecords)
    }),
    // TODO: fail e.g. on decrypt failure
  )
}

export function generateImagePreview(imageObjectURL: string) {
  return new Observable<ImagePreview>(subscriber => {
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
        ctx.drawImage(img, 0, 0, previewBounds.width, previewBounds.width)

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

        const previewData = ctx.getImageData(
          0,
          0,
          previewBounds.width,
          previewBounds.height,
        )
        const previewDataURL = canvas.toDataURL('image/jpeg', 0.9)

        const imagePreview: ImagePreview = {
          objectURL: previewDataURL,
          colors: {
            bl: Array.from(bl).slice(0, 3) as Uint8BitColor,
            br: Array.from(br).slice(0, 3) as Uint8BitColor,
            c: Array.from(c).slice(0, 3) as Uint8BitColor,
            tl: Array.from(tl).slice(0, 3) as Uint8BitColor,
            tr: Array.from(tr).slice(0, 3) as Uint8BitColor,
          },
        }
        subscriber.next(imagePreview)
        subscriber.complete()
      }
    }

    img.src = imageObjectURL
  })
}

export const saveImageRecord = (imageRecord: ImageRecord) => {
  return new Observable<ImageRecord>(subscriber => {
    imageRecord
      .save()
      .then(() => {
        subscriber.next(imageRecord)
        subscriber.complete()
      })
      .catch((error: string) => {
        subscriber.error(error)
      })
  })
}

export const saveImage = (image: Image) => {
  const imageRecord = ImageRecordFactory.build(image)
  return saveImageRecord(imageRecord)
}
