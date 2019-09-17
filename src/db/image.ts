import _ from 'lodash'
import uuid from 'uuid/v4'

import { Model } from 'radiks'
import Image, { UnsavedImage } from 'models/image'
import { encodeColors } from 'utils/colors'

export default class ImageRecord extends Model {
  static className = 'Image'
  static schema = {
    gaiaURL: String,
    name: String,
    type: {
      type: String,
      decrypted: true,
    },
    previewColors: String,
  }
}

export class ImageRecordFactory {
  static build(image: UnsavedImage | Image): ImageRecord {
    const previewColors = encodeColors(
      image.previewColors.bl,
      image.previewColors.br,
      image.previewColors.c,
      image.previewColors.tl,
      image.previewColors.tr,
    )

    return new ImageRecord({
      _id: _.get(image, '_id', uuid()),
      gaiaURL: image.gaiaURL,
      name: image.name,
      previewColors,
      type: image.type,
    })
  }
}
