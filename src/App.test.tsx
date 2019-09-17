import { MuiThemeProvider } from '@material-ui/core/styles'
import React from 'react'
import { Provider } from 'react-redux'

import theme from 'constants/theme'
import { shallow } from 'enzyme'

import App from './App'
import store from './store'

it('renders without crashing', () => {
  shallow(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </MuiThemeProvider>,
  )
})
