export default interface BaseModel {
  _id: string
}

export type UnsavedModel<T extends BaseModel> = Omit<T, '_id'>

export function parseAttribute(attributeValue: string | object) {
  if (typeof attributeValue === 'object') {
    return 'ENCRYPTED'
  }

  return attributeValue
}

type ModelOrigin = 'radiks' | 'local'
export interface ModelParseOptions {
  origin: ModelOrigin
}

export const defaultModelParseOptions: ModelParseOptions = {
  origin: 'local',
}
