import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Badge from '@material-ui/core/Badge'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import CloudIcon from '@material-ui/icons/CloudQueue'
import UploadIcon from '@material-ui/icons/CloudUpload'

import IconWithPopover from 'components/IconWithPopover'
import colors from 'constants/colors'

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

    const Icon = totalCount === 0 ? CloudIcon : UploadIcon
    const icon = (
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
    )

    const unpersisted = true
    const progress = ((successCount + failureCount) / totalCount) * 100

    return (
      <IconWithPopover id="uploads-info-popover" tooltip="Uploads" Icon={icon}>
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
