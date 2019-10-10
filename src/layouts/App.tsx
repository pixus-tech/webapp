import React from 'react'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Hidden from '@material-ui/core/Hidden'

import Header from 'connected-components/Header'
import Menu from 'connected-components/Menu'

const DRAWER_WIDTH = 256

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    content: {
      display: 'flex',
      flex: 1,
      flexFlow: 'row',
      height: '100%',
    },
    drawer: {
      [theme.breakpoints.up('md')]: {
        width: DRAWER_WIDTH,
        flexShrink: 0,
      },
      position: 'relative',
    },
    app: {
      flex: 1,
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
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
        <Container maxWidth="xl">
          <div className={classes.content}>
            <nav className={classes.drawer}>
              <Hidden mdUp implementation="js">
                <Menu
                  PaperProps={{ style: { width: DRAWER_WIDTH } }}
                  variant="temporary"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                />
              </Hidden>
              <Hidden smDown implementation="css">
                <Menu
                  PaperProps={{
                    style: {
                      bottom: 0,
                      position: 'absolute',
                      top: 0,
                      width: DRAWER_WIDTH,
                    },
                  }}
                />
              </Hidden>
            </nav>
            <main className={classes.app}>{children}</main>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default withStyles(styles)(AppLayout)
