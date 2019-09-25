import _ from 'lodash'
import { GroupInvitation, GroupMembership, User as RadiksUser, UserGroup } from 'radiks'
import SigningKey from 'radiks/lib/models/signing-key'
import { addUserGroupKey } from 'radiks/lib/helpers'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import AlbumRecord from 'db/album'
import Album, {
  buildAlbumRecord,
  parseAlbumRecord,
  parseAlbumRecords,
} from 'models/album'

import { isModelOwnedByUser } from 'models/blockstack'
import userSession from 'utils/userSession'

async function getUserGroups(): Promise<UserGroup[]> {
  return await UserGroup.myGroups()
}

export const getAlbumTree = () => {
  return new Observable<Album[]>(subscriber => {
    getUserGroups()
      .then(userGroups => {
        const userGroupMap = _.keyBy(
          _.map(userGroups, userGroup => {
            userGroup.privateKey = userGroup.encryptionPrivateKey()
            return userGroup
          }) ,
          '_id'
        )
        AlbumRecord.fetchList<AlbumRecord>()
          .then(albumRecords => {
            const albums = _.map(parseAlbumRecords(albumRecords), album => ({
              ...album,
              userGroup: userGroupMap[album.userGroupId],
            }))
            subscriber.next(albums)
            subscriber.complete()
          })
          .catch(error => subscriber.error(error))
      })
      .catch(error => subscriber.error(error))
  })
}

async function createInvitation(user: RadiksUser, userGroup: UserGroup) {
  const { publicKey, username } = user.attrs

  const invitation = new GroupInvitation({
    userGroupId: userGroup._id,
    signingKeyPrivateKey: userGroup.privateKey,
    signingKeyId: userGroup.getSigningKey().id,
  })
  invitation.userPublicKey = publicKey
  await invitation.save()
  return invitation
}

async function createGroupMembership(user: RadiksUser, userGroup: UserGroup) {
  const groupMembership = new GroupMembership({
    userGroupId: userGroup._id,
    username: user.attrs.username,
    signingKeyPrivateKey: userGroup.privateKey,
    signingKeyId: userGroup.getSigningKey().id,
    updatable: false,
  });
  await groupMembership.save()
  return groupMembership
}

async function createUserGroup(name: string) {
  const userGroup = new UserGroup({ name })
  const userGroupSigningKey = await SigningKey.create({ userGroupId: userGroup._id })
  userGroup.attrs.signingKeyId = userGroupSigningKey._id
  userGroup.privateKey = userGroupSigningKey.attrs.privateKey
  addUserGroupKey(userGroup)

  const user = RadiksUser.currentUser()
  const invitation = await createInvitation(user, userGroup)
  userGroup.attrs.members.push({
    username: user.attrs.username,
    inviteId: invitation._id,
  })

  await userGroup.save()
  await createGroupMembership(user, userGroup)

  return userGroup
}

export const addAlbum = (name: string) => {
  return new Observable<{ resource: Album }>(subscriber => {
    createUserGroup(name)
      .then(userGroup => {
        const albumRecord = buildAlbumRecord({
          index: 0,
          name,
          userGroupId: userGroup._id,
        })

        albumRecord.save()
                   .then(() => {
                     subscriber.next({ resource: parseAlbumRecord(albumRecord)! })
                     subscriber.complete()
                   })
                   .catch(error => subscriber.error(error))
      })
      .catch(error => subscriber.error(error))
  })
}

export const updateAlbum = (album: Album, updates: Partial<Album>) => {
  const albumRecord = buildAlbumRecord(album)
  albumRecord.update(updates)
  return from(albumRecord.save()).pipe(
    map(response => {
      return { resource: parseAlbumRecord(albumRecord)! }
    }),
  )
}

type StreamCallback = (record: AlbumRecord) => void

let streamCallback: StreamCallback | undefined = undefined

export const unsubscribe = () => {
  AlbumRecord.removeStreamListener(streamCallback as any) // TODO: Wrong type in radiks
  streamCallback = undefined

  return new Observable<undefined>(subscriber => {
    subscriber.complete()
  })
}

export const subscribe = () => {
  if (streamCallback) {
    unsubscribe()
  }

  return new Observable<Album>(subscriber => {
    streamCallback = function streamCallback(record: AlbumRecord) {
      const album = parseAlbumRecord(record)

      if (album === null) {
        return
      }

      subscriber.next(album)
    }

    AlbumRecord.addStreamListener(streamCallback as any) // TODO: Wrong type in radiks
  })
}
