module.exports = {
  // configFunction is the original react-scripts function that creates the
  // Webpack Dev Server config based on the settings for proxy/allowedHost.
  // react-scripts injects this into your function (so you can use it to
  // create the standard config to start from), and needs to receive back a
  // function that takes the same arguments as the original react-scripts
  // function so that it can be used as a replacement for the original one.
  devServer: function (configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost)
      // Edit config here - example: set your own certificates.
      //
      // const fs = require('fs');
      // config.https = {
      //   key: fs.readFileSync(process.env.REACT_HTTPS_KEY, 'utf8'),
      //   cert: fs.readFileSync(process.env.REACT_HTTPS_CERT, 'utf8'),
      //   ca: fs.readFileSync(process.env.REACT_HTTPS_CA, 'utf8'),
      //   passphrase: process.env.REACT_HTTPS_PASS
      // };
      config.headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT",
        "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token, Accept-Encoding",
      }

      return config
    }
  },

  webpack: function override(config, env) {
    config.output.globalObject = `self`
    return config
  },

  jest: config => {
    config.moduleNameMapper = Object.assign({}, config.moduleNameMapper, {
      '^dnd-core$': 'dnd-core/dist/cjs',
      '^react-dnd$': 'react-dnd/dist/cjs',
      '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
      '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
      '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
      '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs',
    })
    return config
  },
}
