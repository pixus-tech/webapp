import React from 'react'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'

const styles = (_theme: Theme) =>
  createStyles({
    center: {
      textAlign: 'center',
    },
  })

type ComposedProps = WithStyles<typeof styles>

const SmartAlbums: React.FC<ComposedProps> = ({ classes }) => {
  return (
    <>
      <Typography className={classes.center} component="h2" variant="h4">
        All smart albums
      </Typography>
    </>
  )
}

export default withStyles(styles)(SmartAlbums)
