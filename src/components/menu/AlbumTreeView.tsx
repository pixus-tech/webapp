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
  setParentAlbum: (album: Album, parentAlbum: Album) => void
}

const AlbumTreeView: React.SFC<IProps> = ({
  activeId,
  albums,
  setParentAlbum,
}) => {
  const classes = useStyles()

  const rootAlbums = _.filter(
    albums,
    album => album.parentAlbumId === undefined,
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <TreeView
        className={classes.root}
        defaultExpanded={['3']}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
      >
        {_.map(rootAlbums, (album, index) => (
          <AlbumTreeItem
            activeId={activeId}
            album={album}
            albums={albums}
            key={index}
            setParentAlbum={setParentAlbum}
          />
        ))}
      </TreeView>
    </DndProvider>
  )
}

export default AlbumTreeView
