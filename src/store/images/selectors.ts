import { List } from 'immutable'

import Album from 'models/album'
import Image, { ImageFilterAttributes } from 'models/image'
import { RootState } from 'typesafe-actions'

import { keyForFilter } from './types'

const dataSelector = (state: RootState) => state.images.data

const filterImageIdsSelector = (
  state: RootState,
  filter: ImageFilterAttributes,
) => {
  const key = keyForFilter({
    page: 0,
    perPage: 1000,
    filter,
  })
  const imageIds = state.images.filterImageIds.get(key)

  if (imageIds === undefined || imageIds.size === 0) {
    return List<string>()
  }

  return imageIds
}

export const filteredImagesSelector = (
  state: RootState,
  filter: ImageFilterAttributes,
): List<Image> => {
  const data = dataSelector(state)
  const imageIds = filterImageIdsSelector(state, filter)

  return imageIds
    .map(imageId => data.get(imageId))
    .filterNot(i => typeof i === 'undefined') as List<Image>
}

export const albumImagesSelector = (
  state: RootState,
  album: Album,
): List<Image> => {
  return filteredImagesSelector(state, { name: 'album', data: album._id })
}
