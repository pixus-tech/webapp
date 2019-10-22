import React from 'react'

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { ReactComponent as NoConnection } from './assets/pluto-no-connection.svg'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      width: 256,
      height: 128,
      '--illu-background': theme.palette.primary.main,
      '--illu-background-alt': theme.palette.primary.light,
      '--illu-primary': theme.palette.secondary.main,
    },
    button: {
      marginTop: theme.spacing(1),
    },
    icon: {
      height: 64,
      width: 64,
    },
  }),
)

interface IProps {
}

function Illustration({
}: IProps) {
  const classes = useStyles()

  return (
    <div className={classes.root}>foo<NoConnection /></div>
  )
}

export default Illustration
