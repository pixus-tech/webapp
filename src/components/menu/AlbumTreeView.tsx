import _ from 'lodash'
import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { makeStyles, createStyles } from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'

import AlbumTreeItem from './AlbumTreeItem'
import Album from 'models/album'

const useStyles = makeStyles(
  createStyles({
    root: {
      height: 264,
      flexGrow: 1,
      maxWidth: 400,
    },
  }),
)

interface IProps {
  activeId?: string
  albums: Album[]
  setAlbumParent: (album: Album, parent: Album) => void
  setAlbumPosition: (album: Album, successor: Album) => void
}

const AlbumTreeView: React.SFC<IProps> = ({
  activeId,
  albums,
  setAlbumParent,
  setAlbumPosition,
}) => {
  const classes = useStyles()

  const orderedAlbums = _.orderBy(albums, album => album.meta.index)
  const rootAlbums = _.filter(
    orderedAlbums,
    album => album.meta.parentId === undefined,
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
      >
        {_.map(rootAlbums, (album, index) => (
          <AlbumTreeItem
            activeId={activeId}
            album={album}
            albums={orderedAlbums}
            key={index}
            setAlbumParent={setAlbumParent}
            setAlbumPosition={setAlbumPosition}
          />
        ))}
      </TreeView>
    </DndProvider>
  )
}

export default AlbumTreeView
