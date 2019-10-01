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

const DRAWER_WIDTH = 256
const APP_BAR_HEIGHT = 56

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      position: 'relative',
      width: '100%',
      display: 'flex',
      flexFlow: 'column',
    },
    content: {
      flex: 1,
      display: 'flex',
      flexFlow: 'row',
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: DRAWER_WIDTH,
        flexShrink: 0,
      },
    },
    app: {
      flex: 1,
    },
  })

type StyleProps = WithStyles<typeof styles>

const AppLayout: React.SFC<StyleProps> = ({ children, classes }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <div className={classes.root}>
      <Header onDrawerToggle={handleDrawerToggle} />
      <div className={classes.content}>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="js">
            <Menu
              PaperProps={{ style: { width: DRAWER_WIDTH } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
            />
          </Hidden>
          <Hidden xsDown implementation="css">
            <Menu
              PaperProps={{
                style: { width: DRAWER_WIDTH, top: APP_BAR_HEIGHT },
              }}
            />
          </Hidden>
        </nav>
        <main className={classes.app}>{children}</main>
      </div>
    </div>
  )
}

export default withStyles(styles)(AppLayout)
