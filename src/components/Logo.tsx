import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headline: {
      fontSize: 24,
      color: theme.palette.common.white,
    },
    highlight: {
      color: theme.palette.secondary.main,
    },
  }),
)
function Logo() {
  const classes = useStyles()

  return (
    <span className={classes.headline}>
      gra<span className={classes.highlight}>ph</span>oto
    </span>
  )
}

export default Logo
