import React from 'react'

import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    progress: {},
  }),
)

interface IProps {
  finishedCount: number
  totalCount: number
}

function Uploads({ finishedCount, totalCount }: IProps) {
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
