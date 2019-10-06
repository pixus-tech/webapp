import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import CloudOffIcon from '@material-ui/icons/CloudOff'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      backgroundColor: theme.palette.primary.dark,
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
  isBlockstackReachable: boolean | null
  isHubReachable: boolean | null
  isRadiksReachable: boolean | null
  onRetry: () => void
}

function ConnectivityFailure({
  isBlockstackReachable,
  isHubReachable,
  isRadiksReachable,
  onRetry,
}: IProps) {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {(!isBlockstackReachable || !isHubReachable || !isRadiksReachable) && (
        <CloudOffIcon className={classes.icon} />
      )}
      {!isBlockstackReachable && (
        <Typography color="inherit" variant="h6" component="p">
          Blockstack Core API could not be reached.
        </Typography>
      )}
      {!isHubReachable && (
        <Typography color="inherit" variant="h6" component="p">
          Your Gaia Hub (data storage) could not be reached.
        </Typography>
      )}
      {!isRadiksReachable && (
        <Typography color="inherit" variant="h6" component="p">
          The central data index could not be reached.
        </Typography>
      )}
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

export default ConnectivityFailure
