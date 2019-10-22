export default interface AlbumMeta {
  index: number
  numberOfImageColumns: number
  parentId?: string
}

export const defaultAlbumMeta: AlbumMeta = {
  index: Number.MAX_SAFE_INTEGER,
  numberOfImageColumns: 6,
  parentId: undefined,
}
