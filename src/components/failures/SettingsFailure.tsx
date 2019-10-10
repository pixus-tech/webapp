import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import SettingsIcon from '@material-ui/icons/Settings'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
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
  onRetry: () => void
}

function SettingsFailure({ onRetry }: IProps) {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <SettingsIcon className={classes.icon} />
      <Typography color="inherit" variant="h6" component="p">
        Your settings could not be loaded. Please check your Gaia Hub
        connection.
      </Typography>
      <Button
        className={classes.button}
        onClick={onRetry}
        color="secondary"
        variant="outlined"
      >
        Retry
      </Button>
    </div>
  )
}

export default SettingsFailure
