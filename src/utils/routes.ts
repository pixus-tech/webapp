import Album from 'models/album'
import { ImageFilterName } from 'models/image'
import history from 'utils/history'

const routes = {
  applicationRoot: '/app/smart-albums/favorites',
  authVerify: '/verify-authentication',
  signInFailure: '/sign-in-failed',
  login: '/login',
  albums: '/app/albums/:albumId',
  smartAlbums: '/app/smart-albums/:filterName',
  settings: '/app/settings',
} as const

export interface ShowAlbumURLParameters {
  albumId: string
}

export interface ShowSmartAlbumURLParameters {
  filterName: ImageFilterName
}

export type RouteNames = keyof typeof routes
export type Routes = typeof routes[RouteNames]

export function buildAlbumRoute(album: Album) {
  return `/app/albums/${album._id}` as Routes
}

export function buildSmartAlbumRoute(filterName: ImageFilterName) {
  return `/app/smart-albums/${filterName}` as Routes
}

export const redirect = (route: Routes) => history.push(route)

export default routes
