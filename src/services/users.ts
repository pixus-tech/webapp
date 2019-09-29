import { lookupProfile } from 'blockstack'
import { GroupInvitation, GroupMembership } from 'radiks'
import { Observable } from 'rxjs'

import Album from 'models/album'
import AlbumRecord, { AlbumRecordFactory } from 'db/album'
import User, { parseProfile } from 'models/user'
import { NotificationType } from 'models/notification'
import { currentUsername, inviteUserToGroup } from 'utils/blockstack'

import { createNotification } from './notifications'

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

  return new Observable<undefined>(subscriber => {
    inviteUserToGroup(user.username, userGroup)
      .then(invite => {
        createNotification(
          {
            addressee: user.username,
            message,
            targetId: invite._id,
            type: NotificationType.AlbumInvite,
          },
          invite.userPublicKey,
        ).subscribe({
          next() {
            subscriber.next()
          },
          error(error) {
            subscriber.error(error)
          },
          complete() {
            subscriber.complete()
          },
        })
      })
      .catch((error: string) => {
        subscriber.error(error)
      })
  })
}

export async function acceptInvitation(invitationId: string) {
  const username = currentUsername()
  const invitation = (await GroupInvitation.findById(
    invitationId,
  )) as GroupInvitation
  const albumId = invitation.attrs.userGroupId as string
  const groupMembership = new GroupMembership({
    userGroupId: albumId,
    username: username,
    signingKeyPrivateKey: invitation.attrs.signingKeyPrivateKey,
    signingKeyId: invitation.attrs.signingKeyId,
    updatable: false,
  })
  await groupMembership.save()
  await GroupMembership.cacheKeys()
  const albumRecord = (await AlbumRecord.findById(albumId)) as AlbumRecord
  albumRecord.privateKey = albumRecord.encryptionPrivateKey()
  albumRecord.update({ users: [...albumRecord.attrs.users, username] })
  await albumRecord.save()
}

// @ts-ignore
window.AI = acceptInvitation
