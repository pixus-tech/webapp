import * as _ from 'lodash'

import BaseModel, { RecursivePartial, UnsavedModel } from './'
import ImageRecord from 'db/radiks/image'
import { decodeColors, Uint8BitColor } from 'utils/colors'

export interface PreviewColors {
  bl: Uint8BitColor
  br: Uint8BitColor
  c: Uint8BitColor
  tl: Uint8BitColor
  tr: Uint8BitColor
}

export interface ImageMetaData {
  height: number
  previewColors: PreviewColors
  previewImageData: ArrayBuffer
  width: number
}

export default interface Image extends BaseModel {
  height: number
  name: string
  previewColors: PreviewColors
  type: string
  userGroupId: string
  username: string
  width: number
}

export type QueryableImageAttributes = RecursivePartial<Image>

export type UnsavedImage = UnsavedModel<Image>

export function imagePath(image: Image) {
  return `images/${image._id}-${image.name}`
}

export function imagePreviewPath(image: Image) {
  return `thumbnails/${image._id}-${image.name}`
}

export function parseImageRecord(record: ImageRecord): Image {
  const decodedColors = decodeColors(record.attrs.previewColors)
  return {
    _id: record._id,
    height: record.attrs.height,
    name: record.attrs.name,
    previewColors: {
      bl: decodedColors[0],
      br: decodedColors[1],
      c: decodedColors[2],
      tl: decodedColors[3],
      tr: decodedColors[4],
    },
    type: record.attrs.type,
    userGroupId: record.attrs.userGroupId,
    username: record.attrs.username,
    width: record.attrs.width,
  }
}

export function parseImageRecords(records: ImageRecord[]): Image[] {
  return _.map(records, parseImageRecord)
}
