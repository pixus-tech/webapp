import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import IconButton from '@material-ui/core/IconButton'
import { List, ListRowProps } from 'react-virtualized'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import CloudIcon from '@material-ui/icons/Cloud'
import ListIcon from '@material-ui/icons/List'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import UploadIcon from '@material-ui/icons/CloudUpload'
import CancelIcon from '@material-ui/icons/Cancel'

import IconWithPopover from 'components/IconWithPopover'

const ROW_HEIGHT = 52
const MAX_HEIGHT = 4 * ROW_HEIGHT
const MAX_WIDTH = 256

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

interface IStateProps {}

interface IState {
  activeTab: number
}

type ComposedProps = WithStyles<typeof styles> &
  IProps &
  IDispatchProps &
  IStateProps

class QueueInfo extends React.PureComponent<ComposedProps, IState> {
  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      activeTab: 0,
    }
  }

  cancelJob = (event: React.MouseEvent<HTMLElement>) => {
    const { id } = event.currentTarget.dataset
    if (typeof id === 'string') {
      // dispatchCancelJobGroup(id)
    }
  }

  JobRow = ({ key, style, index }: ListRowProps) => {
    const items = [] as ListItem[]
    const item = items[index % items.length]

    return (
      <div style={style} key={key}>
        <ListItem ContainerComponent="div" dense>
          <ListItemText primary={item.title} secondary={item.subtitle} />
          <ListItemSecondaryAction>
            <IconButton
              aria-label="delete"
              data-id={item.id}
              edge="end"
              onClick={this.cancelJob}
            >
              <CancelIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </div>
    )
  }

  setActiveTab = (_event: React.ChangeEvent<{}>, activeTab: number) => {
    this.setState({ activeTab })
  }

  render() {
    const items = [] as ListItem[]
    const { classes } = this.props
    const { activeTab } = this.state

    const height = Math.max(
      ROW_HEIGHT,
      Math.min(items.length * ROW_HEIGHT, MAX_HEIGHT),
    )

    return (
      <IconWithPopover
        id="queue-info-popover"
        tooltip="Running jobs"
        Icon={<CloudIcon />}
      >
        <Tabs
          value={activeTab}
          onChange={this.setActiveTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<ListIcon />} aria-label="all" />
          <Tab icon={<DownloadIcon />} aria-label="download" />
          <Tab icon={<UploadIcon />} aria-label="upload" />
        </Tabs>
        <div
          style={{
            height,
            width: MAX_WIDTH,
          }}
        >
          {items.length > 0 ? (
            <List
              className={classes.list}
              height={height}
              rowCount={items.length}
              rowHeight={ROW_HEIGHT}
              rowRenderer={this.JobRow}
              width={MAX_WIDTH}
            />
          ) : (
            <Typography
              className={classes.body}
              color="inherit"
              variant="body1"
              component="p"
            >
              No jobs running.
            </Typography>
          )}
        </div>
      </IconWithPopover>
    )
  }
}

function mapStateToProps(_state: RootState): IStateProps {
  return {}
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
)(QueueInfo)
