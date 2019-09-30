import { createMuiTheme } from '@material-ui/core/styles'

import SourceSansProRegularWoff2 from 'fonts/SourceSansPro-Regular.otf.woff2'
import SourceSansProRegularWoff from 'fonts/SourceSansPro-Regular.otf.woff'

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
    primary: {
      light: '#7e8080',
      main: '#525454',
      dark: '#282828',
    },
    secondary: {
      light: '#59c9eb',
      main: '#0098b9',
      dark: '#006a89',
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
        backgroundColor: '#282828',
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
        backgroundColor: '#404854',
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
