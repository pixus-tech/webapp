import * as _ from 'lodash'
import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { NavLink, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'
import withImmutablePropsToJS from 'with-immutable-props-to-js'
import routes from 'utils/routes'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Drawer, { DrawerProps } from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import HomeIcon from '@material-ui/icons/Home'
import AddDirectoryIcon from '@material-ui/icons/CreateNewFolder'

import AlbumTreeView from 'components/menu/AlbumTreeView'
import Album from 'models/album'
import { addAlbum, getAlbumTree, setParentAlbum } from 'store/albums/actions'

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
      paddingBottom: theme.spacing(2),
    },
    categoryHeaderPrimary: {
      color: theme.palette.common.white,
    },
    item: {
      paddingTop: 1,
      paddingBottom: 1,
      color: 'rgba(255, 255, 255, 0.7)',
      '&:hover,&:focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
    },
    itemCategory: {
      // TODO: Get rid of static colors
      backgroundColor: '#232f3e',
      boxShadow: '0 -1px 0 #404854 inset',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    leftIcon: {
      fontSize: 20,
      marginRight: theme.spacing(1),
    },
    firebase: {
      fontSize: 24,
      color: theme.palette.common.white,
    },
    itemActiveItem: {
      // TODO: Get rid of static colors
      color: '#4fc3f7',
    },
    itemPrimary: {
      fontSize: 'inherit',
    },
    itemIcon: {
      minWidth: 'auto',
      marginRight: theme.spacing(2),
    },
    divider: {
      marginTop: theme.spacing(2),
    },
  })

interface IDispatchProps {
  dispatchAddAlbum: typeof addAlbum.request
  dispatchGetAlbumTree: typeof getAlbumTree.request
  dispatchSetParentAlbum: typeof setParentAlbum.request
}

interface IStateProps {
  albums: { [id: string]: Album }
  albumCount: number
}

interface IProps extends Omit<DrawerProps, 'classes'> {}

type ComposedProps = RouteComponentProps &
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
      albumCount,
      albums,
      dispatchAddAlbum,
      dispatchGetAlbumTree,
      dispatchSetParentAlbum,
      history,
      match,
      staticContext,
      ...other
    } = this.props

    return (
      <Drawer variant="permanent" {...other}>
        <List disablePadding>
          <ListItem
            activeClassName={classes.active}
            button
            component={NavLink}
            to={routes.applicationRoot}
            exact
            className={cx(classes.firebase, classes.item, classes.itemCategory)}
          >
            Reveries
          </ListItem>
          <ListItem className={cx(classes.item, classes.itemCategory)}>
            <ListItemIcon className={classes.itemIcon}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              classes={{
                primary: classes.itemPrimary,
              }}
            >
              Home
            </ListItemText>
          </ListItem>

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
              Albums ({albumCount})
            </ListItemText>
          </ListItem>

          <Divider className={classes.divider} />

          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={() => this.addAlbum('New Album')}
          >
            <AddDirectoryIcon className={classes.leftIcon} />
            Add Album
          </Button>
        </List>
        <AlbumTreeView
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
    albums: state.albums.map,
    albumCount: state.albums.count,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchAddAlbum: (name: string) => dispatch(addAlbum.request(name)),
    dispatchGetAlbumTree: () => dispatch(getAlbumTree.request()),
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
