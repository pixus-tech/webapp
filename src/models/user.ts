import { Person } from 'blockstack'

export default interface User {
  username: string
  name?: string
  imageURL?: string
}

export function parseProfile(username: string, profile: any): User {
  const person = new Person(profile)

  const user: User = {
    username,
    name: person.name(),
    imageURL: person.avatarUrl(),
  }

  return user
}

function initialsFromName(name?: string) {
  if (!name) {
    return undefined
  }

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
}

export function initials(user: User) {
  return initialsFromName(user.name) || user.username.slice(0, 1).toUpperCase()
}

export function userLabel(user: User) {
  if (!user.name) {
    return user.username
  }

  return `${user.name} (${user.username})`
}
