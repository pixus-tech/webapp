import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Badge from '@material-ui/core/Badge'
import Divider from '@material-ui/core/Divider'
import Paper from '@material-ui/core/Paper'
import {
  createStyles,
  Theme,
  makeStyles,
  withStyles,
} from '@material-ui/core/styles'

import CloudIcon from '@material-ui/icons/CloudQueue'
import UploadIcon from '@material-ui/icons/CloudUpload'

import IconWithPopover from 'components/IconWithPopover'
import colors from 'constants/colors'
import { saveDatabase } from 'store/database/actions'
import { resumePendingUploads } from 'store/images/actions'

import Database from './Database'
import Connectivity from './Connectivity'
import StatusRow from './StatusRow'
import Uploads from './Uploads'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divider: {
      backgroundColor: theme.palette.grey[300],
      margin: theme.spacing(1, 0),
    },
    list: {
      outline: 'none',
    },
    menuButton: {
      marginLeft: -theme.spacing(1),
    },
    paper: {
      width: 368,
      padding: theme.spacing(1),
    },
  }),
)

interface ListItem {
  id: string
  title: string
  subtitle?: string
}

interface IProps {}

interface IDispatchProps {
  dispatchResumePendingUploads: () => void
  dispatchSaveDatabase: () => void
}

interface IStateProps {
  currentUploads: { [id: string]: boolean }
  dirtyDBRecordCount: number
  failedUploads: { [id: string]: Error }
  isSavingDB: boolean
  succeededUploads: { [id: string]: boolean }
}

type ComposedProps = IProps & IDispatchProps & IStateProps

const DirtyBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      backgroundColor: colors.red.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
      right: '20%',
      top: '30%',
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: `1px solid ${colors.red.main}`,
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }),
)(Badge)

export function PureStatus({
  currentUploads,
  dirtyDBRecordCount,
  dispatchResumePendingUploads,
  dispatchSaveDatabase,
  failedUploads,
  isSavingDB,
  succeededUploads,
}: ComposedProps) {
  const classes = useStyles()

  const totalCount = _.size(currentUploads)
  const successCount = _.size(succeededUploads)
  const failureCount = _.size(failedUploads)
  const finishedCount = successCount + failureCount
  const areUploadsPending = totalCount > finishedCount

  const Icon = areUploadsPending ? UploadIcon : CloudIcon
  const icon =
    dirtyDBRecordCount > 0 || failureCount > 0 ? (
      <DirtyBadge
        overlap="circle"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        variant="dot"
      >
        <Icon />
      </DirtyBadge>
    ) : (
      <Icon />
    )

  return (
    <IconWithPopover id="uploads-info-popover" tooltip="Uploads" Icon={icon}>
      {() => (
        <Paper className={classes.paper}>
          <Database
            dirtyCount={dirtyDBRecordCount}
            saveDatabase={dispatchSaveDatabase}
            isSaving={isSavingDB}
          />
          <Divider className={classes.divider} />
          <StatusRow title="Uploads">
            <Uploads
              failureCount={failureCount}
              finishedCount={finishedCount}
              totalCount={totalCount}
              retry={dispatchResumePendingUploads}
            />
          </StatusRow>
          <Divider className={classes.divider} />
          <Connectivity />
        </Paper>
      )}
    </IconWithPopover>
  )
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    currentUploads: state.images.currentUploads.toObject(),
    dirtyDBRecordCount: state.database.dirtyCount,
    failedUploads: state.images.failedUploads.toObject(),
    isSavingDB: state.database.isSaving,
    succeededUploads: state.images.succeededUploads.toObject(),
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchResumePendingUploads: () => {
      dispatch(resumePendingUploads())
    },
    dispatchSaveDatabase: () => {
      dispatch(saveDatabase.request())
    },
  }
}

export default compose<ComposedProps, IProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(PureStatus)
