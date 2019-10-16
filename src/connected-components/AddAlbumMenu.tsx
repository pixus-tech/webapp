import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction } from 'typesafe-actions'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AddAlbumIcon from '@material-ui/icons/PhotoAlbum'
import AddDirectoryIcon from '@material-ui/icons/Folder'
import AddIcon from '@material-ui/icons/Add'

import { addAlbum } from 'store/albums/actions'

const styles = (theme: Theme) =>
  createStyles({
    addButton: {
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
      },
      backgroundColor: theme.palette.common.white,
      borderRadius: '50%',
      height: 18,
      minHeight: 0,
      minWidth: 0,
      padding: 0,
      width: 18,
    },
    addIcon: {
      fontSize: 18,
    },
  })

interface IDispatchProps {
  dispatchAddAlbum: typeof addAlbum.request
}

interface IProps {
  className?: string
}

interface IState {
  anchorElement: HTMLElement | null
}

type ComposedProps = IDispatchProps & WithStyles<typeof styles> & IProps

class AddAlbumMenu extends React.Component<ComposedProps, IState> {
  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      anchorElement: null,
    }
  }

  addAlbum = (event: React.MouseEvent<HTMLElement>) => {
    this.preventDefault(event)

    this.props.dispatchAddAlbum({ isDirectory: false })
    this.closeMenu()
  }

  addDirectory = (event: React.MouseEvent<HTMLElement>) => {
    this.preventDefault(event)

    this.props.dispatchAddAlbum({ isDirectory: true })
    this.closeMenu()
  }

  openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.preventDefault(event)

    this.setState({ anchorElement: event.currentTarget })
  }

  closeMenu = () => {
    this.setState({ anchorElement: null })
  }

  preventDefault = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  render() {
    const { classes, className } = this.props
    const { anchorElement } = this.state

    return (
      <div className={className} onClick={this.preventDefault}>
        <Button
          color="primary"
          className={classes.addButton}
          onClick={this.openMenu}
        >
          <AddIcon className={classes.addIcon} />
        </Button>
        <Menu
          id="add-album-menu"
          anchorEl={anchorElement}
          keepMounted
          open={Boolean(anchorElement)}
          onClose={this.closeMenu}
        >
          <MenuItem onClick={this.addAlbum}>
            <AddAlbumIcon />
            New Album
          </MenuItem>
          <MenuItem onClick={this.addDirectory}>
            <AddDirectoryIcon />
            New Directory
          </MenuItem>
        </Menu>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchAddAlbum: params => dispatch(addAlbum.request(params)),
  }
}

export default compose<ComposedProps, IProps>(
  connect(
    undefined,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(AddAlbumMenu)
