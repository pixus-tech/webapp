import { IndexableBoolean } from 'utils/db'
import { EXIFTags } from 'utils/exif'

type AITagsV0 = {}

interface AITagsV1 {}

export enum AIIndexVersion {
  V0 = 0,
  V1 = 1,
}

type AITags = AITagsV0 | AITagsV1

export const CurrentAIIndexVersion = AIIndexVersion.V1

export default interface ImageMeta {
  aiIndexVersion: AIIndexVersion
  aiTags: AITags
  exifTags: EXIFTags
  isDirty: IndexableBoolean
  isFavorite: IndexableBoolean
  isImageStored: IndexableBoolean
  isOnRadiks: IndexableBoolean
  isPreviewImageStored: IndexableBoolean
}

export const defaultImageMeta: ImageMeta = {
  aiIndexVersion: AIIndexVersion.V0,
  aiTags: {},
  exifTags: {},
  isDirty: 1,
  isFavorite: 0,
  isImageStored: 0,
  isOnRadiks: 0,
  isPreviewImageStored: 0,
}
