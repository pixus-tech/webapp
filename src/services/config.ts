export const getConfig = (): AppConfig => {
  return {
    apiUrl: process.env.REACT_APP_API_URL || 'localhost',
  }
}
