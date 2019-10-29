import { rotation, latitude, longitude } from './exif'

describe('latitude', () => {
  it('handles invalidly parsed values', () => {
    const invalidTags = {
      GPSLatitude: 'null',
    }
    expect(latitude(invalidTags as any)).toEqual(0)
  })

  it('handles a plain number', () => {
    const gpsTags = {
      GPSLatitude: 10.58,
    }
    expect(latitude(gpsTags as any)).toEqual(10.58)
  })

  it('handles [degrees, minutes, seconds]', () => {
    const gpsTags = {
      GPSLatitude: [30, 15, 50],
    }
    expect(latitude(gpsTags)).toEqual(30.263888889)
  })

  it('handles [degrees, minutes, seconds] with fractional seconds', () => {
    const gpsTags = {
      GPSLatitude: [30, 15, 50.08],
    }
    expect(latitude(gpsTags)).toEqual(30.263911111)
  })
})

describe('longitude', () => {
  it('handles invalidly parsed values', () => {
    const invalidTags = {
      GPSLongitude: 'null',
    }
    expect(longitude(invalidTags as any)).toEqual(0)
  })

  it('handles a plain number', () => {
    const gpsTags = {
      GPSLongitude: 10.58,
    }
    expect(longitude(gpsTags as any)).toEqual(10.58)
  })

  it('handles [degrees, minutes, seconds] with fractional seconds', () => {
    const gpsTags = {
      GPSLongitude: [-24, 32, 56.6124],
    }
    expect(longitude(gpsTags)).toEqual(-24.549059)
  })
})

describe('image rotation', () => {
  it('handles invalidly parsed values', () => {
    const invalidTags = {
      Orientation: 'null',
    }
    expect(rotation(invalidTags as any)).toEqual(0)
  })

  it('handles Orientation value 1', () => {
    const orientationTags = { Orientation: 1 }
    expect(rotation(orientationTags)).toEqual(0)
  })

  it('handles Orientation value 2', () => {
    const orientationTags = { Orientation: 2 }
    expect(rotation(orientationTags)).toEqual(0)
  })

  it('handles Orientation value 3', () => {
    const orientationTags = { Orientation: 3 }
    expect(rotation(orientationTags)).toEqual(180)
  })

  it('handles Orientation value 4', () => {
    const orientationTags = { Orientation: 4 }
    expect(rotation(orientationTags)).toEqual(180)
  })

  it('handles Orientation value 5', () => {
    const orientationTags = { Orientation: 5 }
    expect(rotation(orientationTags)).toEqual(90)
  })

  it('handles Orientation value 6', () => {
    const orientationTags = { Orientation: 6 }
    expect(rotation(orientationTags)).toEqual(90)
  })

  it('handles Orientation value 7', () => {
    const orientationTags = { Orientation: 7 }
    expect(rotation(orientationTags)).toEqual(270)
  })

  it('handles Orientation value 8', () => {
    const orientationTags = { Orientation: 8 }
    expect(rotation(orientationTags)).toEqual(270)
  })
})
