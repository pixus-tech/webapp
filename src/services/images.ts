import { Observable, forkJoin } from 'rxjs'
import { IMAGE_PREVIEW_SIZE } from 'constants/index'
import Album from 'models/album'
import { FileHandle } from 'models/fileHandle'
import Image, {
  ImageMetaData,
  ImageFilterAttributes,
  imagePath,
  imagePreviewPath,
  parseImageRecords,
} from 'models/image'
import ImageMeta, {
  defaultImageMeta,
  CurrentAIIndexVersion,
} from 'models/imageMeta'
import { Uint8BitColor } from 'utils/colors'
import ImageRecord, { ImageRecordFactory } from 'db/radiks/image'
import BaseService from './baseService'
import { Queue } from './dispatcher'
import files from './files'
import records from './records'
import { currentUsername } from 'utils/blockstack'

class Images extends BaseService {
  refreshImages = (albumId: string) =>
    this.dispatcher.performAsync<undefined>(
      Queue.RecordOperation,
      (resolve, reject) => {
        ImageRecord.fetchList<ImageRecord>({
          userGroupId: albumId,
        })
          .then((imageRecords: ImageRecord[]) => {
            const images = parseImageRecords(imageRecords)
            this.db.images
              .updateAll(images)
              .then(() => {
                resolve(undefined)
              })
              .catch(reject)
          })
          .catch(reject)
      },
    )

  getImagesFromCache = (filter: ImageFilterAttributes) =>
    this.dispatcher.performAsync<Image[]>(
      Queue.RecordOperation,
      (resolve, reject) => {
        this.db.images
          .where(filter)
          .then(resolve)
          .catch(reject)
      },
    )

  save = (image: Image) => {
    const imageRecord = ImageRecordFactory.build(image)
    return records.save(imageRecord)
  }

  delete = (image: Image) => {
    const imageRecord = ImageRecordFactory.build(image)

    return new Observable<Image>(subscriber => {
      records.delete(imageRecord).subscribe({
        next() {
          forkJoin({
            image: files.delete(imagePath(image), image.username),
            previewImage: files.delete(imagePreviewPath(image), image.username),
          }).subscribe({
            next() {
              subscriber.next(image)
              subscriber.complete()
            },
            error(error) {
              subscriber.error(error)
            },
          })
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
  }

  shouldScanAITags = (image: Image) =>
    CurrentAIIndexVersion > image.meta.aiIndexVersion

  updateAITags = (image: Image) => {
    // TODO: get AI Tags
    console.log('TODO')
  }

  shouldUpload = (image: Image) =>
    !image.meta.isOnRadiks ||
    !image.meta.isPreviewImageStored ||
    !image.meta.isImageStored

  uploadImageToAlbum = (image: Image, album: Album) =>
    new Observable<Image>(subscriber => {
      const self = this
      Promise.all([
        this.blobStore.getObjectData(imagePath(image)),
        this.blobStore.getObjectData(imagePreviewPath(image)),
      ])
        .then(([imageData, previewData]) => {
          forkJoin({
            original: files.upload(
              imagePath(image),
              imageData,
              album.publicKey,
            ),
            preview: files.upload(
              imagePreviewPath(image),
              previewData,
              album.publicKey,
            ),
          }).subscribe({
            next() {
              self.save(image).subscribe({
                next() {
                  subscriber.next(image)
                  subscriber.complete()
                },
                error(error) {
                  subscriber.error(error)
                },
              })
            },
            error(error) {
              subscriber.error(error)
            },
          })
        })
        .catch(error => subscriber.error(error))
    })

  addImageToAlbum = (album: Album, fileHandle: FileHandle) => {
    return new Observable<Image>(subscriber => {
      const self = this
      files.read(fileHandle).subscribe({
        next(fileHandleWithData) {
          self.processImage(fileHandleWithData.objectURL).subscribe({
            next(imageMetaData) {
              const imageId = fileHandle._id

              if (album.publicKey === undefined) {
                return subscriber.error(
                  `Public key of album '${album.name}' is missing`,
                )
              }

              const image: Image = {
                _id: imageId,
                createdAt: new Date().getTime(),
                height: imageMetaData.height,
                name: fileHandle.file.name,
                previewColors: imageMetaData.previewColors,
                type: fileHandle.file.type,
                userGroupId: album._id,
                username: currentUsername(),
                width: imageMetaData.width,
                meta: {
                  ...defaultImageMeta,
                  exifTags: fileHandleWithData.exifTags || {},
                },
              }

              self.blobStore.storeData(
                imagePath(image),
                fileHandleWithData.payload,
                image.type,
              )
              self.blobStore.storeData(
                imagePreviewPath(image),
                imageMetaData.previewImageData,
                'image/jpeg',
              )
              self.db.images.add(image)
              subscriber.next(image)
              subscriber.complete()
            },
            error(error) {
              subscriber.error(error)
            },
          })
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
  }

  processImage = (imageObjectURL: string) =>
    this.dispatcher.performAsync<ImageMetaData>(Queue.RAF, function(
      resolve,
      reject,
    ) {
      const img = new window.Image()

      img.onerror = function(error) {
        reject(Error(`Image could not be loaded: ${error}`))
      }

      img.onload = function() {
        URL.revokeObjectURL(img.src) // TODO: should we really revoke it here?

        const canvas = document.createElement('canvas')
        const previewBounds = {
          height:
            img.height < img.width
              ? Math.round((IMAGE_PREVIEW_SIZE / img.width) * img.height)
              : IMAGE_PREVIEW_SIZE,
          width:
            img.height < img.width
              ? IMAGE_PREVIEW_SIZE
              : Math.round((IMAGE_PREVIEW_SIZE / img.height) * img.width),
        }
        canvas.width = previewBounds.width
        canvas.height = previewBounds.height

        const ctx = canvas.getContext('2d')
        if (ctx === null) {
          reject(Error('Could not generade context 2d for image preview.'))
        } else {
          ctx.drawImage(img, 0, 0, previewBounds.width, previewBounds.height)

          const bl = ctx.getImageData(0, previewBounds.height - 1, 1, 1).data
          const br = ctx.getImageData(
            previewBounds.width - 1,
            previewBounds.height - 1,
            1,
            1,
          ).data
          const c = ctx.getImageData(
            Math.floor(previewBounds.width / 2),
            Math.floor(previewBounds.height / 2),
            1,
            1,
          ).data
          const tl = ctx.getImageData(0, 0, 1, 1).data
          const tr = ctx.getImageData(previewBounds.width - 1, 0, 1, 1).data

          canvas.toBlob(
            blob => {
              if (blob === null) {
                reject(Error('Could not get image blob from canvas.'))
              } else {
                const response = new Response(blob)
                response
                  .arrayBuffer()
                  .then(previewImageData => {
                    const imageMetaData: ImageMetaData = {
                      height: img.height,
                      previewColors: {
                        bl: Array.from(bl).slice(0, 3) as Uint8BitColor,
                        br: Array.from(br).slice(0, 3) as Uint8BitColor,
                        c: Array.from(c).slice(0, 3) as Uint8BitColor,
                        tl: Array.from(tl).slice(0, 3) as Uint8BitColor,
                        tr: Array.from(tr).slice(0, 3) as Uint8BitColor,
                      },
                      previewImageData,
                      width: img.width,
                    }
                    resolve(imageMetaData)
                  })
                  .catch(() =>
                    reject(Error('Could not get image blob from canvas.')),
                  )
              }
            },
            'image/jpeg',
            0.9,
          )
        }
      }

      img.src = imageObjectURL
    })

  updateMeta = (image: Image, meta: Partial<ImageMeta>) =>
    this.dispatcher.performAsync<{ resource: Image }>(
      Queue.RecordOperation,
      (resolve, reject) => {
        const updatedMeta: ImageMeta = { ...image.meta, ...meta }
        const updatedImage: Image = {
          ...image,
          meta: updatedMeta,
        }
        this.db.images
          .update(updatedImage)
          .then(() => {
            resolve({ resource: updatedImage })
          })
          .catch(reject)
      },
    )

  download = (image: Image, album: Album, version: 'full' | 'preview') =>
    new Observable<string>(subscriber => {
      const self = this
      const path =
        version === 'full' ? imagePath(image) : imagePreviewPath(image)
      const type = version === 'full' ? image.type : 'image/jpeg'
      self.blobStore
        .getObjectURL(path)
        .then(objectURL => {
          subscriber.next(objectURL)
          subscriber.complete()
        })
        .catch(() => {
          files.download(path, image.username, album.privateKey).subscribe({
            next(data) {
              self.blobStore
                .storeData(path, data.buffer, type)
                .then(objectURL => {
                  subscriber.next(objectURL)
                  subscriber.complete()
                })
                .catch(error => {
                  subscriber.error(error)
                })
            },
            error(error) {
              subscriber.error(error)
            },
          })
        })
    })
}

const images = new Images()
export default images
