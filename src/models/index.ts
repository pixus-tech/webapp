export default interface BaseModel {
  _id: string
}

export type UnsavedModel<T extends BaseModel> = Omit<T, '_id'>

export function parseAttribute(attributeValue: string | object) {
  if (typeof attributeValue === 'object') {
    return 'ENCRYPTED'
  }

  return attributeValue
}

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

/* import uuid from 'uuid/v4'
 * export function buildModel<T extends BaseModel>(model: UnsavedModel<T>): T {
 *   return {
 *     ...model,
 *     _id: uuid(),
 *   }
 * }
 *  */
/*
export interface DataMigrations<Legacy, Latest> {
  [version: number]: (old: Legacy | Latest) => Legacy | Latest
}

export interface VersionedResource {
  version: number
}

export function migrate<Legacy extends VersionedResource, Latest extends VersionedResource>(
  data: Legacy | Latest,
  migrations: DataMigrations<Legacy, Latest>,
): Latest {
  const latestVersion: number = parseInt(_.max(_.keys(migrations)) || '0', 10) + 1
  let migratedData = data

  while (migratedData.version < latestVersion) {
    const migrator = _.get(migrations, migratedData.version)
    if (migrator === undefined) {
      // TODO: Log error
      break
    }
    migratedData = migrator(migratedData)
  }

  return migratedData as Latest
}

export interface AlbumTree__V0 extends VersionedResource {
  albums: string[]
  version: 0
}

interface Album__V0 {
  children: Album__V0[]
  index: number
  name: string
  toggled: boolean
}

export interface AlbumTree__V1 extends VersionedResource {
  root: Album__V0
  version: 1
}

type LegacyTypes = AlbumTree__V0
export interface AlbumTree extends AlbumTree__V1 {}
export interface Album extends Album__V0 {}

export type AllAlbumTreeVersions = LegacyTypes | AlbumTree

const MIGRATIONS: DataMigrations<LegacyTypes, AlbumTree> = {
  0: (oldAlbumTree: AllAlbumTreeVersions): AlbumTree__V1 => ({
    root: {
      children: [],
      index: 0,
      name: 'root',
      toggled: true,
    },
    version: 1,
  }),
}

export function migrateAlbumTree(fileContents: AllAlbumTreeVersions): AlbumTree {
  return migrate<LegacyTypes, AlbumTree>(fileContents, MIGRATIONS)
}
*/
