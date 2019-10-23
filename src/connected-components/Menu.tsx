import _ from 'lodash'
import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { NavLink, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'
import routes, { ShowAlbumURLParameters } from 'utils/routes'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Drawer, { DrawerProps } from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'

import AlbumTreeView from 'components/menu/AlbumTreeView'
import SmartAlbumTreeView from 'components/menu/SmartAlbumTreeView'
import AddAlbumMenu from 'connected-components/AddAlbumMenu'
import Album from 'models/album'
import {
  getAlbums,
  requestSetAlbumPosition,
  setAlbumPosition,
} from 'store/albums/actions'

const styles = (theme: Theme) =>
  createStyles({
    active: {
      '& svg': {
        color: theme.palette.secondary.main,
      },
    },
    addAlbumMenu: {
      marginLeft: theme.spacing(1),
      marginTop: -2,
    },
    categoryHeader: {
      color: theme.palette.common.white,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
    },
    categoryHeaderActive: {
      color: theme.palette.secondary.main,
    },
    categoryHeaderText: {
      alignItems: 'flex-start',
      flex: 'none',
      textTransform: 'uppercase',
    },
    drawerPaper: {
      borderRight: 'none',
    },
    itemCategory: {
      backgroundColor: theme.palette.primary.main,
      boxShadow: `0 -1px 0 ${theme.palette.primary.light} inset`,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    leftIcon: {
      fontSize: 20,
      marginRight: theme.spacing(1),
    },
  })

interface IDispatchProps {
  dispatchGetAlbums: typeof getAlbums
  dispatchSetAlbumPosition: typeof requestSetAlbumPosition
  dispatchSetAlbumParent: (album: Album, parent: Album) => void
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
    this.props.dispatchGetAlbums()
  }

  setAlbumParent = (album: Album, parent: Album) =>
    this.props.dispatchSetAlbumParent(album, parent)

  setAlbumPosition = (album: Album, successor: Album) =>
    this.props.dispatchSetAlbumPosition({ album, successor })

  render() {
    const {
      classes,
      location,
      albumCount: _albumCount,
      albums,
      dispatchGetAlbums: _dispatchGetAlbums,
      dispatchSetAlbumParent: _dispatchSetAlbumParent,
      dispatchSetAlbumPosition: _dispatchSetAlbumPosition,
      history: _history,
      match: _match,
      staticContext: _staticContext,
      ...other
    } = this.props

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
              [classes.categoryHeaderActive]:
                location.pathname === routes.smartAlbumsOverview,
            })}
            component={NavLink}
            to={routes.smartAlbumsOverview}
          >
            <ListItemText
              classes={{
                root: classes.categoryHeaderText,
              }}
            >
              Smart Albums
            </ListItemText>
          </ListItem>
        </List>
        <SmartAlbumTreeView />
        <List disablePadding>
          <ListItem
            button
            className={cx(classes.categoryHeader, {
              [classes.categoryHeaderActive]:
                location.pathname === routes.albumsOverview,
            })}
            component={NavLink}
            to={routes.albumsOverview}
          >
            <ListItemText
              classes={{
                root: classes.categoryHeaderText,
              }}
            >
              My Albums
            </ListItemText>
            <AddAlbumMenu className={classes.addAlbumMenu} />
          </ListItem>
        </List>
        <AlbumTreeView
          albums={_.values(albums)}
          setAlbumParent={this.setAlbumParent}
          setAlbumPosition={this.setAlbumPosition}
        />
      </Drawer>
    )
  }
}

function mapStateToProps(state: RootState): IStateProps {
  return {
    albums: state.albums.data.toObject(),
    albumCount: state.albums.data.size,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchGetAlbums: () => dispatch(getAlbums()),
    dispatchSetAlbumParent: (album, parent) =>
      dispatch(
        setAlbumPosition.request({
          album,
          parentId: parent._id,
          index: Number.MAX_SAFE_INTEGER,
        }),
      ),
    dispatchSetAlbumPosition: payload =>
      dispatch(requestSetAlbumPosition(payload)),
  }
}

export default compose<ComposedProps, IProps>(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(Menu)
