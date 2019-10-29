import _ from 'lodash'

type GPSDegreesMinutesSeconds = [number, number, number]

export interface EXIFTags {
  Make?: string
  Model?: string
  DateTimeOriginal?: string
  DateTimeDigitized?: string
  DateTime?: string
  SceneCaptureType?: string
  Orientation?: number
  GPSLatitude?: GPSDegreesMinutesSeconds
  GPSLongitude?: GPSDegreesMinutesSeconds
  GPSAltitude?: string
}

/*
 * Orientations according to JEITA CP-3451
 * 1 = The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
 * 2 = The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
 * 3 = The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
 * 4 = The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
 * 5 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
 * 6 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
 * 7 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
 * 8 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.
 * Other = reserved
 */
export function rotation(tags: EXIFTags): 0 | 90 | 180 | 270 {
  switch (tags.Orientation) {
    case 1:
    case 2: // The image is mirrored
      return 0
    case 3:
    case 4: // The image is mirrored
      return 180
    case 5:
    case 6: // The image is mirrored
      return 90
    case 7:
    case 8: // The image is mirrored
      return 270
    default:
      return 0
  }
}

function gpsCoordinateToDecimal(gpsCoordinate: any): number {
  if (typeof gpsCoordinate === 'number') {
    return gpsCoordinate
  }

  try {
    if (typeof gpsCoordinate !== 'object' || gpsCoordinate.length !== 3) {
      throw Error('Invalid gps coordinate format')
    }
    const degrees = gpsCoordinate[0]
    const minutes = degrees < 0 ? -gpsCoordinate[1] : gpsCoordinate[1]
    const seconds = degrees < 0 ? -gpsCoordinate[2] : gpsCoordinate[2]
    return _.round(degrees + minutes / 60 + seconds / 3600, 9)
  } catch {
    return 0
  }
}

export function latitude(tags: EXIFTags): number {
  return gpsCoordinateToDecimal(tags.GPSLatitude)
}

export function longitude(tags: EXIFTags): number {
  return gpsCoordinateToDecimal(tags.GPSLongitude)
}
