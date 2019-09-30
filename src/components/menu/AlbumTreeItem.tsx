import * as _ from 'lodash'
import cx from 'classnames'
import React from 'react'
import { DragObjectWithType, useDrag, useDrop } from 'react-dnd'
import { NavLink } from 'react-router-dom'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography'
import PermMediaOutlinedIcon from '@material-ui/icons/PhotoSizeSelectActual'

import Album from 'models/album'
import { buildAlbumRoute } from 'utils/routes'

declare module 'csstype' {
  interface Properties {
    '--tree-view-color'?: string
    '--tree-view-bg-color'?: string
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: 'rgba(255, 255, 255, 0.7)',
      '&:focus > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.primary.dark})`,
        color: 'var(--tree-view-color)',
      },
    },
    dragging: {
      opacity: 0.5,
    },
    dropDisabled: {
      cursor: 'no-drop',
    },
    content: {
      color: 'rgba(255, 255, 255, 0.7)',
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      marginLeft: 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    label: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
    labelRoot: {
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
    link: {
      alignItems: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      outline: 0,
      textDecoration: 'none',
    },
  }),
)

interface IProps {
  album: Album
  albums: Album[]
  setParentAlbum: (album: Album, parentAlbum: Album) => void
}

interface AlbumDragObject extends DragObjectWithType {
  album: Album
}

function preventClickThrough(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  event.preventDefault()
  event.stopPropagation()
}

const AlbumTreeItem: React.SFC<IProps> = ({
  album,
  albums,
  setParentAlbum,
}) => {
  const classes = useStyles()

  const [{ isDragging }, dragRef] = useDrag({
    item: { type: 'album', album },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [{ canDrop }, dropRef] = useDrop({
    accept: 'album',
    canDrop: draggedObject => draggedObject.album._id !== album._id,
    drop: (droppedObject: AlbumDragObject) =>
      setParentAlbum(droppedObject.album, album),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  const childAlbums = _.filter(
    albums,
    otherAlbum => album._id === otherAlbum.parentAlbumId,
  )

  return (
    <TreeItem
      className={cx({
        [classes.dragging]: isDragging,
        [classes.dropDisabled]: !canDrop,
      })}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      ref={dragRef}
      label={
        <div
          className={classes.labelRoot}
          onClick={preventClickThrough}
          ref={dropRef}
        >
          <NavLink className={classes.link} to={buildAlbumRoute(album)}>
            <PermMediaOutlinedIcon
              className={classes.labelIcon}
              color="inherit"
            />
            <Typography variant="body2" className={classes.labelText}>
              {album.name}
            </Typography>
            <Typography variant="caption" color="inherit">
              {1337}
            </Typography>
          </NavLink>
        </div>
      }
      nodeId={album._id}
    >
      {childAlbums.length === 0
        ? null
        : _.map(childAlbums, (album, index) => (
            <AlbumTreeItem
              album={album}
              albums={albums}
              key={index}
              setParentAlbum={setParentAlbum}
            />
          ))}
    </TreeItem>
  )
}

export default AlbumTreeItem
