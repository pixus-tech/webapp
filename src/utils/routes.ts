import Album from 'models/album'
import history from 'utils/history'

const routes = {
  applicationRoot: '/app',
  authVerify: '/verify-authentication',
  login: '/login',
  albumsOverview: '/app/albums',
  albums: '/app/albums/:albumId',
} as const

export function buildAlbumRoute(album: Album) {
  return `/app/albums/${album._id}`
}

export interface ShowAlbumURLParameters {
  albumId: string
}

export type RouteNames = keyof typeof routes
export type Routes = typeof routes[RouteNames]

export const redirect = (route: Routes) => history.push(route)

export default routes
