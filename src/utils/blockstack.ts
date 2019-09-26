import {
  GroupInvitation,
  GroupMembership,
  User as RadiksUser,
  UserGroup,
} from 'radiks'
import SigningKey from 'radiks/lib/models/signing-key'
import { addUserGroupKey } from 'radiks/lib/helpers'

import BaseModel, { UnsavedModel } from 'models/index'

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

async function createGroupMembership(username: string, userGroup: UserGroup) {
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

export function currentUser() {
  return RadiksUser.currentUser()
}

export function currentUserName() {
  return RadiksUser.currentUser().attrs.username
}
