import { Model } from 'radiks'

// Workaround for UserData not being exposed from blockstack.js
// Source is from here: https://github.com/blockstack/blockstack.js/blob/1ca24f2e941bba14ac2fac9500d9e32dbfd0f244/src/auth/authApp.ts

/**
 * The configuration for the user's Gaia storage provider.
 */
export interface GaiaHubConfig {
  address: string
  url_prefix: string
  token: string
  server: string
}

/**
 *  Returned from the [[UserSession.loadUserData]] function.
 */
export interface UserData {
  // public: the blockstack ID (for example: stackerson.id or alice.blockstack.id)
  username: string
  // public: the email address for the user. only available if the `email`
  // scope is requested, and if the user has entered a valid email into
  // their profile.
  //
  // **Note**: Blockstack does not require email validation
  // for users for privacy reasons and blah blah (something like this, idk)
  email?: string
  // probably public: (a quick description of what this is, and a link to the
  // DID foundation and/or the blockstack docs related to DID, idk)
  decentralizedID: string
  // probably private: looks like it happens to be the btc address but idk
  // the value of establishing this as a supported field
  identityAddress: string
  // probably public: this is an advanced feature, I think many app devs
  // using our more advanced encryption functions (as opposed to putFile/getFile),
  // are probably using this. seems useful to explain.
  appPrivateKey: string
  // maybe public: possibly useful for advanced devs / webapps. I see an opportunity
  // to make a small plug about "user owned data" here, idk.
  hubUrl: string
  // maybe private: this would be an advanced field for app devs to use.
  authResponseToken: string
  // private: does not get sent to webapp at all.
  coreSessionToken?: string
  // private: does not get sent to webapp at all.
  gaiaAssociationToken?: string
  // public: this is the proper `Person` schema json for the user.
  // This is the data that gets used when the `new blockstack.Person(profile)` class is used.
  profile: any
  // private: does not get sent to webapp at all.
  gaiaHubConfig?: GaiaHubConfig
}

const GROUP_MEMBERSHIPS_STORAGE_KEY = 'GROUP_MEMBERSHIPS_STORAGE_KEY'

const userGroupKeys = () => {
  const keysString = localStorage.getItem(GROUP_MEMBERSHIPS_STORAGE_KEY)
  let keys = keysString ? JSON.parse(keysString as any) : {}
  keys = {
    userGroups: {},
    signingKeys: {},
    personal: {},
    ...keys,
  }
  return keys
}

export const isModelOwnedByUser = (model: Model) => {
  const keys = userGroupKeys()
  if (model.attrs.signingKeyId === keys.personal._id) {
    return true
  }
  if (model.attrs.userGroupId) {
    let isOwned = false
    Object.keys(keys.userGroups).forEach(groupId => {
      if (groupId === model.attrs.userGroupId) {
        isOwned = true
      }
    })
    return isOwned
  }
  return false
}
