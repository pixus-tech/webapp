import _ from 'lodash'
import cx from 'classnames'
import React from 'react'
import { DragObjectWithType, useDrag, useDrop } from 'react-dnd'
import { NavLink } from 'react-router-dom'

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography'

import DirectoryIcon from '@material-ui/icons/Folder'

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
    active: {
      color: theme.palette.secondary.main,
    },
    root: {
      color: 'rgba(255, 255, 255, 0.7)',
      '&:focus > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.primary.main})`,
        color: 'var(--tree-view-color)',
      },
    },
    directoryIcon: {
      marginTop: -3,
      marginRight: 4,
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
    linkActive: {
      color: theme.palette.secondary.main,
    },
    spacerItem: {
      height: theme.spacing(0.5),
    },
    spacerItemHovered: {
      '&::after': {
        content: '" "',
        display: 'block',
        marginTop: 2,
        height: 2,
        borderRadius: 2,
        width: '100%',
        pointerEvents: 'none',
        backgroundColor: theme.palette.secondary.main,
      },
    },
  }),
)

interface IProps {
  activeId?: string
  album: Album
  albums: Album[]
  setAlbumParent: (album: Album, parent: Album) => void
  setAlbumPosition: (album: Album, successor: Album) => void
}

interface AlbumDragObject extends DragObjectWithType {
  album: Album
}

function preventClickThrough(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  event.preventDefault()
  event.stopPropagation()
}

const AlbumTreeItem: React.SFC<IProps> = ({
  activeId,
  album,
  albums,
  setAlbumParent,
  setAlbumPosition,
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
              {album.isDirectory && (
                <DirectoryIcon className={classes.directoryIcon} />
              )}
              <Typography
                variant="body1"
                className={cx(classes.labelText, {
                  [classes.active]: activeId === album._id,
                })}
              >
                {album.name}
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
                activeId={activeId}
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
