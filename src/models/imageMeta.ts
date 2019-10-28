import { IndexableBoolean } from 'utils/db'

type EXIFTagsV0 = {}

interface EXIFTagsV1 {
  Make?: string
  Model?: string
  DateTimeOriginal?: string
  DateTimeDigitized?: string
  DateTime?: string
  SceneCaptureType?: string
  Orientation?: string
  GPSLatitude?: string
  GPSLongitude?: string
  GPSAltitude?: string
}

export enum EXIFIndexVersion {
  V0 = 0,
  V1 = 1,
}

type EXIFTags = EXIFTagsV0 | EXIFTagsV1

export const CurrentEXIFIndexVersion = EXIFIndexVersion.V1

export enum AIIndexVersion {
  V0 = 0,
  V1 = 1,
}

export default interface ImageMeta {
  aiIndexVersion: AIIndexVersion
  exifIndexVersion: EXIFIndexVersion
  exifTags: EXIFTags
  isDirty: IndexableBoolean
  isFavorite: IndexableBoolean
  isImageStored: IndexableBoolean
  isOnRadiks: IndexableBoolean
  isPreviewImageStored: IndexableBoolean
}

export const defaultImageMeta: ImageMeta = {
  aiIndexVersion: AIIndexVersion.V0,
  exifIndexVersion: EXIFIndexVersion.V0,
  exifTags: {},
  isDirty: 1,
  isFavorite: 0,
  isImageStored: 0,
  isOnRadiks: 0,
  isPreviewImageStored: 0,
}
