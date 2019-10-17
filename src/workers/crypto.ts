// eslint-disable-next-line
import CryptoWorker from 'worker-loader!workers/crypto.worker'
import { Buffer } from 'buffer'
import { registerWorker, postJob } from './'

const cryptoWorker = new CryptoWorker()
registerWorker(cryptoWorker)

export function encrypt(buffer: Buffer | string, publicKey: string) {
  return postJob<string>(cryptoWorker, 'encrypt', { buffer, key: publicKey })
}

export function decrypt(buffer: string, privateKey: string) {
  return postJob<string>(cryptoWorker, 'decrypt', { buffer, key: privateKey })
}
