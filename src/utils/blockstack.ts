import {
  GroupInvitation,
  GroupMembership,
  Member,
  User as RadiksUser,
  UserGroup,
} from 'radiks'
import SigningKey from 'radiks/lib/models/signing-key'
import { addUserGroupKey } from 'radiks/lib/helpers'

import AlbumRecord from 'db/album'
import BaseModel, { UnsavedModel } from 'models/index'

export function currentUser() {
  return RadiksUser.currentUser()
}

export function currentUsername() {
  return RadiksUser.currentUser().attrs.username
}

async function createInvitation(user: RadiksUser, userGroup: UserGroup) {
  const { publicKey } = user.attrs

  const invitation = new GroupInvitation({
    userGroupId: userGroup._id,
    signingKeyPrivateKey: userGroup.privateKey,
    signingKeyId: userGroup.getSigningKey().id,
  })
  invitation.userPublicKey = publicKey
  await invitation.save()
  return invitation
}

export async function createGroupMembership(
  username: string,
  userGroup: UserGroup,
) {
  const groupMembership = new GroupMembership({
    userGroupId: userGroup._id,
    username: username,
    signingKeyPrivateKey: userGroup.privateKey,
    signingKeyId: userGroup.getSigningKey().id,
    updatable: false,
  })
  await groupMembership.save()
  return groupMembership
}

export async function createUserGroup<
  Record extends UserGroup,
  Model extends BaseModel
>(
  factory: (model: UnsavedModel<Model> | Model) => Record,
  payload: UnsavedModel<Model> | Model,
): Promise<Record> {
  const creator = currentUser()
  const username = creator.attrs.username
  const userGroup = factory(payload)
  const userGroupSigningKey = await SigningKey.create({
    userGroupId: userGroup._id,
  })
  userGroup.attrs.signingKeyId = userGroupSigningKey._id
  userGroup.privateKey = userGroupSigningKey.attrs.privateKey
  addUserGroupKey(userGroup)

  const invitation = await createInvitation(creator, userGroup)
  userGroup.attrs.members.push({
    username,
    inviteId: invitation._id,
  })

  await userGroup.save()
  await createGroupMembership(username, userGroup)

  return userGroup
}

export async function inviteUserToGroup(
  username: string,
  userGroup: UserGroup,
) {
  let inviteId = null
  userGroup.attrs.members.forEach((member: Member) => {
    if (member.username === username) {
      inviteId = member.inviteId
    }
  })

  if (inviteId) {
    const invitation = await GroupInvitation.findById(inviteId, {
      decrypt: false,
    })
    return invitation as GroupInvitation
  }

  const invitation = await GroupInvitation.makeInvitation(username, userGroup)
  userGroup.attrs.members.push({
    username,
    inviteId: invitation._id,
  })
  await userGroup.save()
  return invitation
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
