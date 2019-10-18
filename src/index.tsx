import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
// Polyfills for localization
// https://github.com/formatjs/react-intl/blob/master/docs/Upgrade-Guide.md#migrate-to-using-native-intl-apis
import 'intl-pluralrules'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/dist/locale-data/en'
import '@formatjs/intl-relativetimeformat/dist/locale-data/zh'

import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider } from '@material-ui/core/styles'

import InitializationGate from 'containers/gates/InitializationGate'
import theme from 'constants/theme'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from './App'
import * as serviceWorker from './serviceWorker'
import storeConfiguration from './store'

const Root = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Provider store={storeConfiguration.store}>
      <InitializationGate>
        <App />
      </InitializationGate>
    </Provider>
  </MuiThemeProvider>
)

ReactDOM.render(<Root />, document.getElementById('root'))

serviceWorker.register()
