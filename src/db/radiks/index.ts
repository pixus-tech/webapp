import { Attrs, Model } from 'radiks'
import AsyncCrypto from './concerns/crypto'

export default class BaseRecord extends Model {
  async encrypted(): Promise<Attrs> {
    return await AsyncCrypto.encrypt(this)
  }

  async decrypt() {
    return await AsyncCrypto.decrypt(this)
  }
}
