import _ from 'lodash'
import uuid from 'uuid/v4'

import BaseRecord from './index'
import Image, { UnsavedImage } from 'models/image'
import { encodeColors } from 'utils/colors'

export default class ImageRecord extends BaseRecord {
  static className = 'Image'
  static schema = {
    height: {
      type: Number,
      decrypted: true,
    },
    name: String,
    previewColors: String,
    type: {
      type: String,
      decrypted: true,
    },
    userGroupId: {
      type: String,
      decrypted: true,
    },
    username: String,
    width: {
      type: Number,
      decrypted: true,
    },
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
      height: image.height,
      name: image.name,
      previewColors,
      type: image.type,
      userGroupId: image.userGroupId,
      username: image.username,
      width: image.width,
    })
  }
}
