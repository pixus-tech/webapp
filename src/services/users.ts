import _ from 'lodash'
import { lookupProfile } from 'blockstack'
import { forkJoin, Observable } from 'rxjs'
import { ajax } from 'rxjs/ajax'

import Album from 'models/album'
import { AlbumRecordFactory } from 'db/album'
import User, { parseProfile } from 'models/user'
import { NotificationType } from 'models/notification'
import { acceptInvitation, inviteUserToGroup } from 'utils/blockstack'
import { BlockstackCore } from 'typings/blockstack'

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

  inviteUsersToAlbum = (users: User[], album: Album, message?: string) => {
    return new Observable<undefined>(subscriber => {
      forkJoin(
        users.map(user => this.inviteUserToAlbum(user, album, message)),
      ).subscribe({
        complete() {
          subscriber.next()
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
  }

  acceptInvitation = (invitationId: string) =>
    this.dispatcher.performAsync<undefined>(
      Queue.RecordOperation,
      (resolve, reject) =>
        acceptInvitation(invitationId)
          .then(() => resolve(undefined))
          .catch(reject),
    )

  search = (partialUsername: string) =>
    this.dispatcher.performAsync<User[]>(
      Queue.RecordOperation,
      (resolve, reject) => {
        ajax
          .getJSON<BlockstackCore.SearchResponse>(
            `${this.config.blockstackCoreUrl}/search?query=${partialUsername}`,
          )
          .subscribe({
            next(response) {
              const resultsWithUsername = _.filter(
                response.results,
                result => typeof result.username === 'string',
              )
              const users = _.map(resultsWithUsername, result =>
                // The list has been filtered for entries with username so it is safe to:
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                parseProfile(result.username!, result.profile),
              )
              resolve(users)
            },
            error(error) {
              reject(error)
            },
          })
      },
    )
}

export default new Users()
