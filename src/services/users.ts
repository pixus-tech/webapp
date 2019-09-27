import { lookupProfile } from 'blockstack'
import { Observable } from 'rxjs'

import Album from 'models/album'
import { AlbumRecordFactory } from 'db/album'
import User, { parseProfile } from 'models/user'
import { inviteUserToGroup } from 'utils/blockstack'

export function findUser(username: string) {
  return new Observable<User>(subscriber => {
    lookupProfile(username)
      .then((profile: any) => {
        subscriber.next(parseProfile(username, profile))
        subscriber.complete()
      })
      .catch((error: string) => {
        subscriber.error(error)
      })
  })
}

export function inviteUserToAlbum(user: User, album: Album, message?: string) {
  const userGroup = AlbumRecordFactory.build(album)

  return new Observable<User>(subscriber => {
    inviteUserToGroup(user.username, userGroup)
      .then(invite => {
        subscriber.next()
        subscriber.complete()
      })
      .catch((error: string) => {
        subscriber.error(error)
      })
  })
}
