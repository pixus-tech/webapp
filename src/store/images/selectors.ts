import { List } from 'immutable'

import Album from 'models/album'
import Image from 'models/image'
import { RootState } from 'typesafe-actions'

import { keyForFilter } from './types'

const dataSelector = (state: RootState) => state.images.data

const albumImageIdsSelector = (state: RootState, album: Album) => {
  const key = keyForFilter({
    page: 0,
    perPage: 1000,
    attributes: { userGroupId: album._id },
  })
  const imageIds = state.images.filterImageIds.get(key)

  if (imageIds === undefined || imageIds.size === 0) {
    return List<string>()
  }

  return imageIds
}

export const albumImagesSelector = (
  state: RootState,
  album: Album,
): List<Image> => {
  const data = dataSelector(state)
  const imageIds = albumImageIdsSelector(state, album)

  return imageIds
    .map(imageId => data.get(imageId))
    .filterNot(i => typeof i === 'undefined') as List<Image>
}
