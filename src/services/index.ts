import albums from './albums'
import connectivity from './connectivity'
import Dispatcher from './dispatcher'
import files from './files'
import images from './images'
import notifications from './notifications'
import records from './records'
import settings from './settings'
import users from './users'

const services = {
  albums,
  connectivity,
  dispatcher: Dispatcher.sharedInstance(),
  files,
  images,
  notifications,
  records,
  settings,
  users,
}

export default services
