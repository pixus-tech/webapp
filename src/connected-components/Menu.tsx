import _ from 'lodash'
import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { NavLink, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'
import withImmutablePropsToJS from 'with-immutable-props-to-js'
import routes, { ShowAlbumURLParameters } from 'utils/routes'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Drawer, { DrawerProps } from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import AddDirectoryIcon from '@material-ui/icons/CreateNewFolder'

import AlbumTreeView from 'components/menu/AlbumTreeView'
import Album from 'models/album'
import { addAlbum, getAlbums, setParentAlbum } from 'store/albums/actions'

const styles = (theme: Theme) =>
  createStyles({
    active: {
      '& svg': {
        color: theme.palette.secondary.main,
      },
    },
    button: {
      margin: theme.spacing(1),
    },
    categoryHeader: {
      color: 'rgba(255, 255, 255, 0.7)',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
    },
    categoryHeaderPrimary: {
      color: theme.palette.common.white,
      textTransform: 'uppercase',
    },
    drawerPaper: {
      borderRight: 'none',
    },
    itemCategory: {
      // TODO: Get rid of static colors
      backgroundColor: theme.palette.primary.main,
      boxShadow: '0 -1px 0 #404854 inset',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    leftIcon: {
      fontSize: 20,
      marginRight: theme.spacing(1),
    },
    itemActiveItem: {
      // TODO: Get rid of static colors
      color: '#4fc3f7',
    },
  })

interface IDispatchProps {
  dispatchAddAlbum: typeof addAlbum.request
  dispatchGetAlbumTree: typeof getAlbums.request
  dispatchSetParentAlbum: typeof setParentAlbum.request
}

interface IStateProps {
  albums: { [id: string]: Album }
  albumCount: number
}

interface IProps extends Omit<DrawerProps, 'classes'> {}

type ComposedProps = RouteComponentProps<ShowAlbumURLParameters> &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles> &
  IProps

class Menu extends React.Component<ComposedProps> {
  componentDidMount() {
    this.props.dispatchGetAlbumTree()
  }

  requestData = () => this.props.dispatchGetAlbumTree()

  addAlbum = (name: string) => this.props.dispatchAddAlbum(name)

  setParentAlbum = (album: Album, parentAlbum: Album) =>
    this.props.dispatchSetParentAlbum({ album, parentAlbum })

  render() {
    const {
      classes,
      location,
      albumCount: _albumCount,
      albums,
      dispatchAddAlbum: _dispatchAddAlbum,
      dispatchGetAlbumTree: _dispatchGetAlbumTree,
      dispatchSetParentAlbum: _dispatchSetParentAlbum,
      history: _history,
      match,
      staticContext: _staticContext,
      ...other
    } = this.props

    // TODO: match params are currently not correct
    const activeId = match.params.albumId

    return (
      <Drawer
        variant="permanent"
        classes={{
          paperAnchorDockedLeft: classes.drawerPaper,
        }}
        {...other}
      >
        <List disablePadding>
          <ListItem
            button
            className={cx(classes.categoryHeader, {
              [classes.itemActiveItem]:
                location.pathname === routes.albumsOverview,
            })}
            component={NavLink}
            to={routes.albumsOverview}
          >
            <ListItemText
              classes={{
                primary: classes.categoryHeaderPrimary,
              }}
            >
              Albums
            </ListItemText>
          </ListItem>
        </List>
        <Button
          variant="outlined"
          color="secondary"
          className={classes.button}
          onClick={() => this.addAlbum('New Album')}
        >
          <AddDirectoryIcon className={classes.leftIcon} />
          Add Album
        </Button>
        <AlbumTreeView
          activeId={activeId}
          albums={_.values(albums)}
          setParentAlbum={this.setParentAlbum}
        />
      </Drawer>
    )
  }
}

function mapStateToProps(state: RootState) {
  // TODO use `IStateProps` as a return type...
  return {
    albums: state.albums.data,
    albumCount: state.albums.data.size,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchAddAlbum: (name: string) => dispatch(addAlbum.request(name)),
    dispatchGetAlbumTree: () => dispatch(getAlbums.request()),
    dispatchSetParentAlbum: payload =>
      dispatch(setParentAlbum.request(payload)),
  }
}

export default compose<ComposedProps, IProps>(
  withRouter,
  connect<IStateProps, IDispatchProps, undefined, RootState>(
    mapStateToProps as any, // TODO: remove the as any cast once the return type of mapStateToProps is fixed
    mapDispatchToProps,
  ),
  withImmutablePropsToJS,
  withStyles(styles),
)(Menu)
