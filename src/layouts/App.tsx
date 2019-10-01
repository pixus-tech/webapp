import React from 'react'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import Hidden from '@material-ui/core/Hidden'

import Header from 'connected-components/Header'
import Menu from 'connected-components/Menu'

const menuWidth = 256

const styles = (theme: Theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: menuWidth,
        flexShrink: 0,
      },
    },
    app: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    main: {
      flex: 1,
      // TODO: get rid of static color here
      background: '#eaeff1',
    },
    footer: {
      padding: theme.spacing(2),
      // TODO: get rid of static color here
      background: '#eaeff1',
    },
  })

type StyleProps = WithStyles<typeof styles>

const AppLayout: React.SFC<StyleProps> = ({ children, classes }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <>
      <nav className={classes.drawer}>
        <Hidden smUp implementation="js">
          <Menu
            PaperProps={{ style: { width: menuWidth } }}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
          />
        </Hidden>
        <Hidden xsDown implementation="css">
          <Menu PaperProps={{ style: { width: menuWidth } }} />
        </Hidden>
      </nav>
      <div className={classes.app}>
        <Header onDrawerToggle={handleDrawerToggle} />
        <main className={classes.main}>{children}</main>
      </div>
    </>
  )
}

export default withStyles(styles)(AppLayout)
