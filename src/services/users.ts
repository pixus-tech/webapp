import { lookupProfile } from 'blockstack'
import { GroupInvitation, GroupMembership } from 'radiks'

import Album from 'models/album'
import AlbumRecord, { AlbumRecordFactory } from 'db/album'
import User, { parseProfile } from 'models/user'
import { NotificationType } from 'models/notification'
import { currentUsername, inviteUserToGroup } from 'utils/blockstack'

import notifications from './notifications'
import BaseService from './baseService'
import { Queue } from './dispatcher'

class Users extends BaseService {
  find = (username: string) =>
    this.dispatcher.performAsync<User>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      lookupProfile(username)
        .then((profile: any) => {
          resolve(parseProfile(username, profile))
        })
        .catch(reject)
    })

  inviteUserToAlbum = (user: User, album: Album, message?: string) =>
    this.dispatcher.performAsync<undefined>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      const userGroup = AlbumRecordFactory.build(album)
      inviteUserToGroup(user.username, userGroup)
        .then(invite => {
          notifications
            .createNotification(
              {
                addressee: user.username,
                message,
                targetId: invite._id,
                type: NotificationType.AlbumInvite,
              },
              invite.userPublicKey,
            )
            .subscribe({
              error(error) {
                reject(error)
              },
              complete() {
                resolve(undefined)
              },
            })
        })
        .catch(reject)
    })

  async _acceptInvitation(invitationId: string) {
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

  acceptInvitation = (invitationId: string) =>
    this.dispatcher.performAsync<undefined>(
      Queue.RecordOperation,
      (resolve, reject) =>
        this._acceptInvitation(invitationId)
          .then(() => resolve(undefined))
          .catch(reject),
    )
}

export default new Users()
