import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { MuiThemeProvider } from '@material-ui/core/styles'
import theme from 'constants/theme'

const ThemeDecorator = storyFn => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {storyFn()}
  </MuiThemeProvider>
)

export default ThemeDecorator
