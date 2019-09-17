import React from 'react'
import Container from '@material-ui/core/Container'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  })

type StyleProps = WithStyles<typeof styles>

const UnauthorizedLayout: React.FC<StyleProps> = ({ children, classes }) => (
  <Container component="main" maxWidth="xs">
    <div className={classes.paper}>{children}</div>
  </Container>
)

export default withStyles(styles)(UnauthorizedLayout)
