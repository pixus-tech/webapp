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
