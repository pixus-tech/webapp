import * as _ from 'lodash'
import { Model } from 'radiks'

import BaseModel, { UnsavedModel } from './'
import ImageRecord from 'db/image'
import { decodeColors, encodeColors, Uint8BitColor } from 'utils/colors'

export interface PreviewColors {
  bl: Uint8BitColor
  br: Uint8BitColor
  c: Uint8BitColor
  tl: Uint8BitColor
  tr: Uint8BitColor
}

export interface ImagePreview {
  objectURL: string
  colors: PreviewColors
}

export default interface Image extends BaseModel {
  gaiaURL: string
  name: string
  previewColors: PreviewColors
  type: string
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
    gaiaURL: record.attrs.gaiaURL,
    previewColors: {
      bl: decodedColors[0],
      br: decodedColors[1],
      c: decodedColors[2],
      tl: decodedColors[3],
      tr: decodedColors[4],
    },
    name: record.attrs.name,
    type: record.attrs.type,
  }
}

export function parseImageRecords(records: ImageRecord[]): Image[] {
  return _.map(records, parseImageRecord)
}
