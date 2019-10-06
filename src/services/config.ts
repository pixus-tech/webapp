export const getConfig = (): AppConfig => {
  return {
    blockstackCoreUrl:
      process.env.REACT_APP_BLOCKSTACK_CORE_URL ||
      'https://core.blockstack.org/v1/',
    radiksUrl: process.env.REACT_APP_RADIKS_URL || 'http://localhost:1260',
  }
}
