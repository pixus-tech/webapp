import { Observable, forkJoin } from 'rxjs'
import { IMAGE_PREVIEW_SIZE } from 'constants/index'
import Album from 'models/album'
import { FileHandle } from 'models/fileHandle'
import Image, {
  ImageMetaData,
  imageUploadPath,
  imagePreviewUploadPath,
  parseImageRecords,
} from 'models/image'
import { Uint8BitColor } from 'utils/colors'
import ImageRecord, { ImageRecordFactory } from 'db/image'
import BaseService from './baseService'
import { Queue } from './dispatcher'
import files from './files'
import records from './records'
import { currentUsername } from 'utils/blockstack'

class Images extends BaseService {
  getAlbumImages = (album: Album) =>
    this.dispatcher.performAsync<Image[]>(Queue.RecordOperation, function(
      resolve,
      reject,
    ) {
      ImageRecord.fetchList<ImageRecord>({
        albumIds: album._id,
      })
        .then((imageRecords: ImageRecord[]) => {
          resolve(parseImageRecords(imageRecords))
        })
        .catch(reject)
    })

  save = (image: Image) => {
    const imageRecord = ImageRecordFactory.build(image)
    return records.save(imageRecord)
  }

  uploadImageToAlbum = (album: Album, fileHandle: FileHandle) => {
    return new Observable<Image>(subscriber => {
      files.read(fileHandle).subscribe({
        next(fileHandleWithData) {
          images.processImage(fileHandleWithData.objectURL).subscribe({
            next(imageMetaData) {
              const imageId = fileHandle._id
              forkJoin({
                original: files.upload(
                  imageUploadPath(imageId),
                  fileHandleWithData.payload,
                  album.publicKey,
                ),
                preview: files.upload(
                  imagePreviewUploadPath(imageId),
                  imageMetaData.previewImageData,
                  album.publicKey,
                ),
              }).subscribe({
                next({ original, preview }) {
                  const image: Image = {
                    _id: imageId,
                    albumIds: [album._id],
                    height: imageMetaData.height,
                    name: fileHandle.file.name,
                    previewColors: imageMetaData.previewColors,
                    type: fileHandle.file.type,
                    userGroupId: album._id,
                    username: currentUsername(),
                    width: imageMetaData.width,
                  }
                  images.save(image).subscribe({
                    next(imageRecord) {
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
                  .catch(error =>
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
}

const images = new Images()
export default images
