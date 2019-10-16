import Album from 'models/album'
import history from 'utils/history'

const routes = {
  applicationRoot: '/app',
  authVerify: '/verify-authentication',
  login: '/login',
  albumsOverview: '/app/albums',
  albums: '/app/albums/:albumId',
  settings: '/app/settings',
} as const

export interface ShowAlbumURLParameters {
  albumId: string
}

export type RouteNames = keyof typeof routes
export type Routes = typeof routes[RouteNames]

export function buildAlbumRoute(album: Album) {
  return `/app/albums/${album._id}` as Routes
}

export const redirect = (route: Routes) => history.push(route)

export default routes
