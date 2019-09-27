import {
  getName,
  getAvatarUrl,
} from 'blockstack/lib/profiles/profileSchemas/personUtils'

export default interface User {
  username: string
  name?: string
  imageURL?: string
}

export function parseProfile(username: string, profile: any): User {
  const user: User = {
    username,
    name: getName(profile),
    imageURL: getAvatarUrl(profile),
  }
  return user
}
