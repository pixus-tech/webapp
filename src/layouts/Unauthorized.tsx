import React from 'react'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import Header from 'components/Header'
import WBM from 'components/ci/WBM'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  })

type StyleProps = WithStyles<typeof styles>

const UnauthorizedLayout: React.FC<StyleProps> = ({ children, classes }) => (
  <div className={classes.root}>
    <Header>
      <Grid item xs />
      <WBM />
      <Grid item xs />
    </Header>
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>{children}</div>
    </Container>
  </div>
)

export default withStyles(styles)(UnauthorizedLayout)
