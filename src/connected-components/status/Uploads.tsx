import React from 'react'

import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((_theme: Theme) =>
  createStyles({
    progress: {},
  }),
)

interface IProps {
  finishedCount: number
  failureCount: number
  retry: () => void
  totalCount: number
}

function Uploads({ failureCount, finishedCount, retry, totalCount }: IProps) {
  const classes = useStyles()

  const areUploadsPending = totalCount > finishedCount
  const progress = ((finishedCount + 0.5) / totalCount) * 100

  if (areUploadsPending) {
    return (
      <>
        <LinearProgress
          className={classes.progress}
          color="secondary"
          variant="determinate"
          value={progress}
        />
        <Typography color="inherit" variant="body1" component="p">
          Encrypting and uploading file {1 + finishedCount} of {totalCount}.
          {failureCount > 0 && (
            <>
              <br />
              {failureCount} Uploads have failed.
            </>
          )}
        </Typography>
      </>
    )
  }

  if (failureCount > 0) {
    return (
      <>
        <Typography color="inherit" variant="body1" component="p">
          {failureCount} files could not be uploaded.{' '}
          <Button color="secondary" onClick={retry}>
            Try again
          </Button>
        </Typography>
      </>
    )
  }

  return (
    <Typography color="inherit" variant="body1" component="p">
      There are no uploads pending.
    </Typography>
  )
}

export default Uploads
