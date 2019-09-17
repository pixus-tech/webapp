import { AppConfig } from 'blockstack'
import routes from 'utils/routes'

export const appConfig = new AppConfig(
  ['store_write', 'publish_data'],
  'https://192.168.1.158:3000',
  routes.authVerify,
)
