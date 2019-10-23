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
  exifTags: EXIFTags
  exifIndexVersion: EXIFIndexVersion
  aiIndexVersion: AIIndexVersion
  isFavorite: boolean
}

export const defaultImageMeta: ImageMeta = {
  exifTags: {},
  exifIndexVersion: EXIFIndexVersion.V0,
  aiIndexVersion: AIIndexVersion.V0,
  isFavorite: false,
}
