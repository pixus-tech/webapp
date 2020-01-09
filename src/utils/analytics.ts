// Fathom is documented here
// https://usefathom.com/support/goals
declare const fathom: any

type Goal =
  | 'createAlbum'
  | 'createDirectory'
  | 'arrangeAlbum'
  | 'setImageColumnCount'
  | 'shareAlbum'
  | 'uploadImages'
  | 'deleteImage'
  | 'saveImage'
  | 'saveSettings'

function goalId(goal: Goal) {
  switch (goal) {
    case 'createAlbum':
      return 'DZZEJBYI'
    case 'createDirectory':
      return 'DINHDCLZ'
    case 'arrangeAlbum':
      return '7E2TJKBV'
    case 'setImageColumnCount':
      return 'YDBMFK4N'
    case 'shareAlbum':
      return 'T5TJPF0E'
    case 'uploadImages':
      return 'IOJZPJMX'
    case 'deleteImage':
      return 'TDKVWGX7'
    case 'saveImage':
      return 'RJJMJ79P'
    case 'saveSettings':
      return '7IH1GNWN'
    default:
      return 'XDRMZV31'
  }
}

export default class Analytics {
  private static safelyCallFathom(
    _action: 'set' | 'trackPageview' | 'trackGoal',
    _key: string,
    _value: null | string | number,
  ) {
    try {
      // Disable goal tracking for now because of new NIL guidelines
      // fathom(action, key, value)
    } catch {
      // nothing to do, fathom was not initialized
    }
  }

  static disable() {
    // kind of a hack to "disable" fathom if it was already loaded
    this.safelyCallFathom('set', 'siteId', null)
  }

  static track(goal: Goal, value = 0) {
    this.safelyCallFathom('trackGoal', goalId(goal), value)
  }
}
