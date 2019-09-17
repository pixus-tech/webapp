import userSession from './userSession'

export async function loadFile(url: string, type: string) {
  return (await userSession.getFile(url)) as string
  /* const fileBuffer = await userSession.getFile(url)
   * // TODO: extract into web worker
   * const blob = new Blob([fileBuffer], { type })
   * const objectURL = URL.createObjectURL(blob)
   * return objectURL */
}
