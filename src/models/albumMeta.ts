import { IndexableBoolean } from 'utils/db'

export default interface AlbumMeta {
  index: number
  isDirty: IndexableBoolean
  isOnRadiks: IndexableBoolean
  numberOfImageColumns: number
  parentId?: string
}

export const defaultAlbumMeta: AlbumMeta = {
  index: Number.MAX_SAFE_INTEGER,
  isDirty: 1,
  isOnRadiks: 0,
  numberOfImageColumns: 6,
  parentId: undefined,
}
