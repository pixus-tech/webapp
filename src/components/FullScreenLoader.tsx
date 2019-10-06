import React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      backgroundColor: theme.palette.primary.dark,
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
      justifyContent: 'center',
      position: 'fixed',
      width: '100%',
    },
  }),
)

interface IProps {
  children?: React.ReactNode
  isLoading: boolean
}

function FullScreenLoader({ children, isLoading }: IProps) {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {isLoading && <CircularProgress color="secondary" size={48} />}
      {children}
    </div>
  )
}

export default FullScreenLoader
