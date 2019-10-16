export default interface AlbumMeta {
  index: number
  parentId?: string
}

export const defaultAlbumMeta: AlbumMeta = {
  index: Number.MAX_SAFE_INTEGER,
  parentId: undefined,
}
