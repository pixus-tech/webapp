import React from 'react'
import { compose } from 'recompose'

import Popover from '@material-ui/core/Popover'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(1),
    },
    popover: {
      zIndex: theme.zIndex.tooltip,
    },
  })

interface IProps {
  id: string
  tooltip: string
  Icon: React.ReactNode
}

interface IState {
  anchorElement: HTMLElement | null
}

type ComposedProps = WithStyles<typeof styles> & IProps

class IconWithPopover extends React.PureComponent<ComposedProps, IState> {
  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      anchorElement: null,
    }
  }

  togglePopover = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget
    this.setState(state => ({
      anchorElement: state.anchorElement === null ? target : null,
    }))
  }

  closePopover = () => {
    this.setState({
      anchorElement: null,
    })
  }

  render() {
    const { classes, children, id: popoverId, tooltip, Icon } = this.props
    const { anchorElement } = this.state

    const isOpen = Boolean(anchorElement)
    const id = isOpen ? popoverId : undefined

    return (
      <>
        <Tooltip title={tooltip}>
          <IconButton
            color="inherit"
            edge="end"
            aria-label="delete"
            aria-describedby={id}
            onClick={this.togglePopover}
          >
            {Icon}
          </IconButton>
        </Tooltip>
        <Popover
          anchorEl={anchorElement}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          className={classes.popover}
          id={id}
          onClose={this.closePopover}
          open={isOpen}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Paper className={classes.paper}>{isOpen && children}</Paper>
        </Popover>
      </>
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(
  IconWithPopover,
)
