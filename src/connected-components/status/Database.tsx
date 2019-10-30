import React from 'react'
import cx from 'classnames'

import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import RefreshIcon from '@material-ui/icons/Autorenew'

import StatusRow from './StatusRow'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rotating: {
      animation: `$loading-rotate 1250ms ${theme.transitions.easing.easeInOut} 200ms infinite`,
    },
    '@keyframes loading-rotate': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(360deg)',
      },
    },
  }),
)

interface IProps {
  dirtyCount: number
  isSaving: boolean
  saveDatabase: () => void
}

function Database({ dirtyCount, isSaving, saveDatabase }: IProps) {
  const classes = useStyles()

  const title = (
    <>
      Database
      <Tooltip title="Sync your local database">
        <IconButton onClick={saveDatabase}>
          <RefreshIcon className={cx({ [classes.rotating]: isSaving })} />
        </IconButton>
      </Tooltip>
    </>
  )

  return (
    <StatusRow title={title}>
      <Typography color="inherit" variant="body1" component="p">
        {dirtyCount > 0 ? (
          <>
            {dirtyCount} unsynced entries in the database.
            <br />
            {isSaving
              ? 'Database is syncing...'
              : 'Click the sync button above to sync now.'}
          </>
        ) : (
          <>The database is synced.</>
        )}
      </Typography>
    </StatusRow>
  )
}

export default Database
