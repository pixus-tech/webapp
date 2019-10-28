import { fromJS, Map } from 'immutable'
import { API } from 'typings/types'
import Album from 'models/album'
import Image, { ImageFilterAttributes } from 'models/image'
import ImageMeta from 'models/imageMeta'
import { FileHandle } from 'models/fileHandle'

export type ImageFilter = API.ResourceFilter<ImageFilterAttributes>

export interface AlbumFileHandle {
  album: Album
  fileHandle: FileHandle
}

export interface AlbumImage {
  album: Album
  image: Image
}

export interface FilteredImages {
  images: Image[]
  filter: ImageFilter
}

export interface ImageMetaUpdates {
  image: Image
  updates: Partial<ImageMeta>
}

export function keyForFilter({
  filter,
  page,
  perPage,
}: ImageFilter): Map<string, any> {
  return fromJS({ page, perPage, ...filter })
}
