import React from 'react'

import Typography from '@material-ui/core/Typography'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    wrapper: {
      paddingLeft: theme.spacing(2),
    },
  }),
)

interface IProps {
  children: React.ReactNode
  title: React.ReactNode
}

function StatusRow({ children, title }: IProps) {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography color="inherit" variant="h6" component="h6">
        {title}
      </Typography>
      <div className={classes.wrapper}>{children}</div>
    </div>
  )
}

export default StatusRow
