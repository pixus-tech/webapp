import _ from 'lodash'

export type Uint8BitColor = [number, number, number]

function colorToHex(color: number) {
  return color.toString(16).padStart(2, '0')
}

export function encodeColor([red, green, blue]: Uint8BitColor): string {
  return `${colorToHex(red)}${colorToHex(green)}${colorToHex(blue)}`
}

export function encodeColors(...colors: Uint8BitColor[]): string {
  return _.map(colors, encodeColor).join('')
}

function decomposeColors(serialization: string): string[] {
  return serialization.match(/.{1,2}/g) || []
}

export function decodeColors(colorString: string): Uint8BitColor[] {
  return _.chunk(
    _.map(decomposeColors(colorString), x => parseInt(x, 16)),
    3,
  ) as Uint8BitColor[]
}
