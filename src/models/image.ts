import * as _ from 'lodash'

import BaseModel, { UnsavedModel } from './'
import ImageRecord from 'db/image'
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
  albumIds: string[]
  height: number
  name: string
  previewColors: PreviewColors
  type: string
  username: string
  width: number
}

export type UnsavedImage = UnsavedModel<Image>

export function imageUploadPath(id: string) {
  return `images/${id}`
}

export function imagePreviewUploadPath(id: string) {
  return `previews/${id}`
}

export function parseImageRecord(record: ImageRecord): Image {
  const decodedColors = decodeColors(record.attrs.previewColors)
  return {
    _id: record._id,
    albumIds: record.attrs.albumIds,
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
    username: record.attrs.username,
    width: record.attrs.width,
  }
}

export function parseImageRecords(records: ImageRecord[]): Image[] {
  return _.map(records, parseImageRecord)
}
