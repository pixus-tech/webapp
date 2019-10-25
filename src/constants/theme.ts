import { createMuiTheme } from '@material-ui/core/styles'

import SourceSansProRegularWoff2 from 'fonts/SourceSansPro-Regular.otf.woff2'
import SourceSansProRegularWoff from 'fonts/SourceSansPro-Regular.otf.woff'

import colors from 'constants/colors'

const sourceSansPro = {
  regular: {
    fontFamily: 'SourceSansPro',
    fontStyle: 'normal',
    fontWeight: 'normal',
    src: `
    local('SourceSansPro'),
    local('SourceSansPro-Regular'),
    url(${SourceSansProRegularWoff2}) format('woff2'),
    url(${SourceSansProRegularWoff}) format('woff')
    `,
  },
}

let theme = createMuiTheme({
  palette: {
    type: 'light',
    text: {
      primary: colors.black.main,
      secondary: colors.black.light,
    },
    divider: colors.black.light,
    background: {
      paper: colors.white.main,
      default: colors.white.dark,
    },
    common: {
      black: colors.black.main,
      white: colors.white.main,
    },
    primary: {
      light: colors.black.light,
      main: colors.black.main,
      dark: colors.black.dark,
    },
    secondary: {
      light: colors.blue.light,
      main: colors.blue.main,
      dark: colors.blue.dark,
      contrastText: colors.white.main,
    },
    error: {
      light: colors.red.light,
      main: colors.red.main,
      dark: colors.red.dark,
    },
  },
  typography: {
    fontFamily: 'SourceSansPro, sans-serif',
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  props: {
    MuiTab: {
      disableRipple: true,
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
})

theme = {
  ...theme,
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [sourceSansPro.regular],
      },
    },
    MuiDrawer: {
      paper: {
        backgroundColor: theme.palette.primary.main,
      },
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(0,0,0,0.75)',
      },
    },
    MuiButton: {
      label: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      root: {
        marginLeft: theme.spacing(1),
      },
      indicator: {
        height: 3,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        margin: '0 16px',
        minWidth: 0,
        padding: 0,
        [theme.breakpoints.up('md')]: {
          padding: 0,
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      root: {
        padding: theme.spacing(1),
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 4,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    MuiListItemText: {
      primary: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'inherit',
        marginRight: 0,
        '& svg': {
          fontSize: 20,
        },
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
      },
    },
  },
}

export default theme
