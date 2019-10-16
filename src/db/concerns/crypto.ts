import { Attrs, Model, Schema, SchemaAttribute } from 'radiks'
import { encrypt, decrypt } from 'workers/index'

function castValueToClass(value: string, valueClass: any) {
  if (valueClass === Boolean) {
    return value === 'true'
  }

  if (valueClass === Number) {
    return parseFloat(value)
  }

  if (valueClass === Array || valueClass === Object) {
    return JSON.parse(value)
  }

  return value
}

function castClassToString(value: any, valueClass: any) {
  if (valueClass === Boolean) {
    return value ? 'true' : 'false'
  }

  if (valueClass === Number) {
    return String(value)
  }

  if (valueClass === Array || valueClass === Object) {
    return JSON.stringify(value)
  }

  return value
}

async function encryptAttributes(
  attributes: any,
  publicKey: string,
  schema: Schema,
) {
  const encryptedAttributes: Attrs = { ...attributes }

  await Promise.all(
    Object.keys(schema).map(
      key =>
        new Promise(resolve => {
          let valueClass = schema[key]
          const schemaAttribute = schema[key] as SchemaAttribute
          const value = attributes[key]

          if (typeof value === 'undefined') {
            return resolve()
          }

          if (schemaAttribute.type) {
            valueClass = schemaAttribute.type
          }

          if (schemaAttribute.decrypted) {
            encryptedAttributes[key] = value
            return resolve()
          }

          const stringValue = castClassToString(value, valueClass)
          encrypt(stringValue, publicKey)
            .then(encryptedValue => {
              try {
                encryptedAttributes[key] = JSON.parse(encryptedValue)
              } catch {
                encryptedAttributes[key] = encryptedValue
              }
            })
            .finally(resolve)
        }),
    ),
  )

  return encryptedAttributes
}

async function decryptAttributes(
  encryptedAttributes: any,
  privateKey: string,
  schema: Schema,
) {
  const decryptedAttributes = { ...encryptedAttributes }

  await Promise.all(
    Object.keys(encryptedAttributes).map(
      key =>
        new Promise(resolve => {
          const value = encryptedAttributes[key]
          let valueClass = schema[key]
          const schemaAttribute = schema[key] as SchemaAttribute
          if (schemaAttribute && schemaAttribute.type) {
            valueClass = schemaAttribute.type
          }
          if (valueClass && schemaAttribute && !schemaAttribute.decrypted) {
            decrypt(
              typeof value === 'string' ? value : JSON.stringify(value),
              privateKey,
            )
              .then(decryptedValue => {
                decryptedAttributes[key] = castValueToClass(
                  decryptedValue,
                  valueClass,
                )
              })
              .finally(resolve)
          } else {
            resolve()
          }
        }),
    ),
  )

  return decryptedAttributes
}

const AsyncCrypto = {
  async decrypt<T extends Model>(model: T) {
    const privateKey = await model.encryptionPrivateKey()
    model.attrs = await decryptAttributes(model.attrs, privateKey, model.schema) // eslint-disable-line require-atomic-updates
    return model
  },
  async encrypt<T extends Model>(model: T): Promise<Attrs> {
    const publicKey = await model.encryptionPublicKey()
    const attributes = {
      ...model.attrs,
      _id: model._id,
    }
    return await encryptAttributes(attributes, publicKey, model.schema)
  },
}

export default AsyncCrypto
