import { fromJS, Map } from 'immutable'
import { API } from 'typings/types'
import Image, { QueryableImageAttributes } from 'models/image'

export type ImageFilter = API.ResourceFilter<QueryableImageAttributes>

export interface FilteredImages {
  images: Image[]
  filter: ImageFilter
}

export function keyForFilter({
  page,
  perPage,
  attributes,
}: ImageFilter): Map<string, any> {
  return fromJS({ page, perPage, ...attributes })
}
