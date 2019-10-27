import React from 'react'

import AppBar from '@material-ui/core/AppBar'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      backgroundColor: theme.palette.primary.main,
      zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
      [theme.breakpoints.up('md')]: {
        minHeight: 60,
      },
    },
  }),
)

interface IProps {
  children: React.ReactNode
  onDrawerToggle?: () => void
}

function Header({ children }: IProps) {
  const classes = useStyles()

  return (
    <AppBar
      className={classes.appBar}
      color="primary"
      elevation={3}
      position="static"
    >
      <Container maxWidth="xl">
        <Toolbar
          classes={{
            root: classes.toolbar,
          }}
        >
          <Grid container spacing={1} alignItems="center">
            {children}
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
