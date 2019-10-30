import * as _ from 'lodash'

import BaseModel, {
  UnsavedModel,
  ModelParseOptions,
  defaultModelParseOptions,
} from './'
import ImageMeta from './imageMeta'
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
  createdAt: number
  height: number
  name: string
  previewColors: PreviewColors
  type: string
  userGroupId: string
  username: string
  width: number

  // Fields that are stored separately from radiks
  meta: ImageMeta
}

export type ImageFilterName =
  | 'album'
  | 'favorites'
  | 'recent-uploads'
  | 'pending-uploads'
export interface ImageFilterAttributes {
  name: ImageFilterName
  data?: any
}

export type UnsavedImage = UnsavedModel<Image>
export interface RemoteImage extends Omit<Image, 'meta'> {
  meta: Partial<ImageMeta>
}

export function imagePath(image: Image) {
  return `images/${image._id}-${image.name}`
}

export function imagePreviewPath(image: Image) {
  return `thumbnails/${image._id}-${image.name}`
}

export function parseImageRecord(
  record: ImageRecord,
  options: ModelParseOptions = defaultModelParseOptions,
): RemoteImage {
  const decodedColors = decodeColors(record.attrs.previewColors)
  const createdAt = record.attrs.createdAt || new Date().getTime()
  let meta: Partial<ImageMeta> = {}
  if (options.origin === 'radiks') {
    meta = {
      isOnRadiks: 1,
      isImageStored: 1,
      isPreviewImageStored: 1,
    }
  }

  return {
    _id: record._id,
    createdAt,
    height: record.attrs.height,
    meta,
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

export function parseImageRecords(
  records: ImageRecord[],
  options: ModelParseOptions = defaultModelParseOptions,
): RemoteImage[] {
  return _.map(records, r => parseImageRecord(r, options))
}
