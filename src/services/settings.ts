import { Observable } from 'rxjs'

import { SETTINGS_FILE_PATH } from 'constants/index'
import BaseService from './baseService'
import files from './files'
import SettingsSchema, { parseSettings } from 'models/settings'

class Settings extends BaseService {
  save = (settings: SettingsSchema) =>
    new Observable<SettingsSchema>(subscriber => {
      const payload = JSON.stringify(settings)
      files.upload(SETTINGS_FILE_PATH, payload).subscribe({
        complete() {
          subscriber.next(settings)
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })

  load = () =>
    new Observable<SettingsSchema>(subscriber => {
      files.download(SETTINGS_FILE_PATH).subscribe({
        next(rawSettings) {
          try {
            const settings = parseSettings(rawSettings)
            subscriber.next(settings)
            subscriber.complete()
          } catch (error) {
            subscriber.error(error)
          }
        },
        error(error) {
          subscriber.error(error)
        },
      })
    })
}

export default new Settings()
