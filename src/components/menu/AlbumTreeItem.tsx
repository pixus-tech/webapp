import _ from 'lodash'
import cx from 'classnames'
import React from 'react'
import { DragObjectWithType, useDrag, useDrop } from 'react-dnd'
import { NavLink } from 'react-router-dom'

import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography'

import DirectoryIcon from '@material-ui/icons/Folder'

import Album from 'models/album'
import { buildAlbumRoute } from 'utils/routes'
import { preventClickThrough } from 'utils/ui'
import { treeItemStyles } from './styles'

declare module 'csstype' {
  interface Properties {
    '--tree-view-color'?: string
    '--tree-view-bg-color'?: string
  }
}

interface IProps {
  album: Album
  albums: Album[]
  setAlbumParent: (album: Album, parent: Album) => void
  setAlbumPosition: (album: Album, successor: Album) => void
}

interface AlbumDragObject extends DragObjectWithType {
  album: Album
}

const AlbumTreeItem: React.SFC<IProps> = ({
  album,
  albums,
  setAlbumParent,
  setAlbumPosition,
}) => {
  const classes = treeItemStyles()

  const [{ isDragging }, dragRef] = useDrag({
    item: { type: 'album', album },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [{ canDrop }, dropRef] = useDrop({
    accept: 'album',
    canDrop: draggedObject =>
      draggedObject.album._id !== album._id && album.isDirectory,
    drop: (droppedObject: AlbumDragObject) =>
      setAlbumParent(droppedObject.album, album),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  const [{ isOver }, spacerDropRef] = useDrop({
    accept: 'album',
    drop: (droppedObject: AlbumDragObject) =>
      setAlbumPosition(droppedObject.album, album),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  })

  const childAlbums = _.filter(
    albums,
    otherAlbum => album._id === otherAlbum.meta.parentId,
  )

  return (
    <>
      <TreeItem
        className={cx(classes.spacerItem, {
          [classes.spacerItemHovered]: isOver,
        })}
        nodeId={`${album._id}-spacer`}
        ref={spacerDropRef}
      />
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
            <NavLink
              activeClassName={classes.linkActive}
              className={classes.link}
              to={buildAlbumRoute(album)}
            >
              {album.isDirectory && <DirectoryIcon className={classes.icon} />}
              <Typography variant="body1">{album.name}</Typography>
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
                setAlbumParent={setAlbumParent}
                setAlbumPosition={setAlbumPosition}
              />
            ))}
      </TreeItem>
    </>
  )
}

export default AlbumTreeItem
