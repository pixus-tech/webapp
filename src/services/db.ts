import _ from 'lodash'
import { Observable, forkJoin, from } from 'rxjs'

import {
  ALBUMS_FILE_PATH,
  IMAGES_FILE_PATH,
  NOTIFICATIONS_FILE_PATH,
} from 'constants/index'
import Album from 'models/album'
import Image, { ImageFilterAttributes, RemoteImage } from 'models/image'
import Notification, {
  NotificationFilterAttributes,
  RemoteNotification,
} from 'models/notification'
import { dbWorker } from 'workers'

import { setDirty, saveDatabase } from 'store/database/actions'
import { SAVE_DATABASE_DEBOUNCE_DURATION } from 'constants/index'
import BaseService from './baseService'
import files from './files'

class DB extends BaseService {
  albums = {
    add: (album: Album) => {
      this.setDirty(1)
      return dbWorker.addAlbum(album)
    },
    all: function() {
      return dbWorker.allAlbums()
    },
    update: (album: Partial<Album>) => {
      this.setDirty(1)
      return dbWorker.updateAlbum(album)
    },
    updateAll: (albums: Partial<Album>[]) => {
      this.setDirty(albums.length)
      return dbWorker.updateAlbums(albums)
    },
    save: () => {
      return this.save(dbWorker.serializeAlbums, ALBUMS_FILE_PATH)
    },
    load: () => {
      return this.load(dbWorker.deserializeAlbums, ALBUMS_FILE_PATH)
    },
  }

  images = {
    add: (image: Image) => {
      this.setDirty(1)
      return dbWorker.addImage(image)
    },
    destroy: (image: Image) => {
      this.setDirty(1)
      return dbWorker.destroyImage(image)
    },
    where: function(filter: ImageFilterAttributes) {
      return dbWorker.filteredImages(filter)
    },
    update: (image: Partial<Image>) => {
      this.setDirty(1)
      return dbWorker.updateImage(image)
    },
    updateAll: (images: Partial<Image>[] | RemoteImage[]) => {
      this.setDirty(images.length)
      return dbWorker.updateImages(images)
    },
    save: () => {
      return this.save(dbWorker.serializeImages, IMAGES_FILE_PATH)
    },
    load: () => {
      return this.load(dbWorker.deserializeImages, IMAGES_FILE_PATH)
    },
  }

  notifications = {
    where: function(filter: NotificationFilterAttributes) {
      return dbWorker.filteredNotifications(filter)
    },
    update: (notification: Partial<Notification>) => {
      this.setDirty(1)
      return dbWorker.updateNotification(notification)
    },
    updateAll: (
      notifications: Partial<Notification>[] | RemoteNotification[],
    ) => {
      this.setDirty(notifications.length)
      return dbWorker.updateNotifications(notifications)
    },
    save: () => {
      return this.save(dbWorker.serializeNotifications, NOTIFICATIONS_FILE_PATH)
    },
    load: () => {
      return this.load(
        dbWorker.deserializeNotifications,
        NOTIFICATIONS_FILE_PATH,
      )
    },
  }

  private setDirty(count: number) {
    this.dispatch(setDirty(count))
    this.debouncedDispatchSaveAll()
  }

  private save = (serialize: () => Promise<string>, path: string) =>
    new Observable<boolean>(subscriber => {
      serialize()
        .then(json => {
          files.upload(path, json).subscribe({
            next() {
              subscriber.next(true)
              subscriber.complete()
            },
            error(error) {
              subscriber.error(error)
            },
          })
        })
        .catch(subscriber.error)
    })

  private load = (
    deserialize: (json: string | Buffer) => Promise<boolean>,
    path: string,
  ) =>
    new Observable<boolean>(subscriber => {
      files.download(path).subscribe({
        next(content) {
          deserialize(
            typeof content === 'string' ? content : content.toString(),
          )
            .then(success => {
              subscriber.next(success)
              subscriber.complete()
            })
            .catch(subscriber.error)
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })

  private dispatchSaveAll = () => this.dispatch(saveDatabase.request())
  private debouncedDispatchSaveAll = _.debounce(
    this.dispatchSaveAll,
    SAVE_DATABASE_DEBOUNCE_DURATION,
  )

  saveAll = () =>
    forkJoin({
      albums: this.albums.save(),
      images: this.images.save(),
      notifications: this.notifications.save(),
    })

  loadAll = () =>
    forkJoin({
      albums: this.albums.load(),
      images: this.images.load(),
      notifications: this.notifications.load(),
    })

  wipe = () => from(dbWorker.wipe())
}

export default new DB()
