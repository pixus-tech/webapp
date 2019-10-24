import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import CloudOffIcon from '@material-ui/icons/CloudOff'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { predict } from 'workers/ai'
import catImage from "cat.jpg"

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

function onLoad(event: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = event.target as HTMLImageElement

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    return
  }
  ctx.drawImage(img, 0, 0, img.width, img.height)
  const imageData = ctx.getImageData(0,0,img.width,img.height)
  predict(imageData)
}

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
      <img src={catImage} onLoad={onLoad} />
      {(!isBlockstackReachable || !isHubReachable || !isRadiksReachable) && (
        <CloudOffIcon className={classes.icon} />
      )}
      {isBlockstackReachable === false && (
        <Typography color="inherit" variant="h6" component="p">
          Blockstack Core API could not be reached.
        </Typography>
      )}
      {isHubReachable === false && (
        <Typography color="inherit" variant="h6" component="p">
          Your Gaia Hub (data storage) could not be reached.
        </Typography>
      )}
      {isRadiksReachable === false && (
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
