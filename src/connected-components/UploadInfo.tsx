import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import UploadIcon from '@material-ui/icons/CloudUpload'

import IconWithPopover from 'components/IconWithPopover'

const styles = (theme: Theme) =>
  createStyles({
    body: {
      padding: theme.spacing(2),
      textAlign: 'center',
    },
    list: {
      outline: 'none',
    },
    menuButton: {
      marginLeft: -theme.spacing(1),
    },
  })

interface ListItem {
  id: string
  title: string
  subtitle?: string
}

interface IProps {}

interface IDispatchProps {}

interface IStateProps {
  currentUploadIds: string[]
  failedUploads: { [key: string]: Error }
  succeededUploadIds: string[]
}

type ComposedProps = WithStyles<typeof styles> &
  IProps &
  IDispatchProps &
  IStateProps

class UploadInfo extends React.PureComponent<ComposedProps> {
  render() {
    const {
      classes,
      currentUploadIds,
      failedUploads,
      succeededUploadIds,
    } = this.props

    const totalCount = currentUploadIds.length
    const successCount = succeededUploadIds.length
    const failureCount = _.size(failedUploads)

    if (totalCount === 0) {
      return null
    }

    const progress = ((successCount + failureCount) / totalCount) * 100

    return (
      <IconWithPopover
        id="uploads-info-popover"
        tooltip="Uploads"
        Icon={<UploadIcon />}
      >
        <div>
          <LinearProgress
            color="secondary"
            variant="determinate"
            value={progress}
          />
          <Typography
            className={classes.body}
            color="inherit"
            variant="body1"
            component="p"
          >
            Processing and uploading file{' '}
            {Math.max(1, successCount + failureCount)} of {totalCount}.
          </Typography>
        </div>
      </IconWithPopover>
    )
  }
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    currentUploadIds: state.images.currentUploadIds.toArray(),
    failedUploads: state.images.failedUploads.toObject(),
    succeededUploadIds: state.images.succeededUploadIds.toArray(),
  }
}

function mapDispatchToProps(_dispatch: Dispatch<RootAction>): IDispatchProps {
  return {}
}

export default compose<ComposedProps, IProps>(
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(UploadInfo)
