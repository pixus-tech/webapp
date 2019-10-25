import { fromJS, Map } from 'immutable'
import { API } from 'typings/types'
import Image, { ImageFilterAttributes } from 'models/image'

export type ImageFilter = API.ResourceFilter<ImageFilterAttributes>

export interface FilteredImages {
  images: Image[]
  filter: ImageFilter
}

export function keyForFilter({
  filter,
  page,
  perPage,
}: ImageFilter): Map<string, any> {
  return fromJS({ page, perPage, ...filter })
}
