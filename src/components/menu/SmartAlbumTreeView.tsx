import React from 'react'

import { makeStyles, createStyles } from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'

import FavoritesIcon from '@material-ui/icons/Star'
import LastUploadIcon from '@material-ui/icons/History'

import SmartAlbumTreeItem from './SmartAlbumTreeItem'
import { buildSmartAlbumRoute } from 'utils/routes'

const useStyles = makeStyles(
  createStyles({
    root: {},
  }),
)

const SmartAlbumTreeView: React.SFC = () => {
  const classes = useStyles()

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
    >
      <SmartAlbumTreeItem
        title="Favorites"
        targetPath={buildSmartAlbumRoute('favorites')}
        Icon={FavoritesIcon}
      />
      <SmartAlbumTreeItem
        title="Last Upload"
        targetPath={buildSmartAlbumRoute('last-upload')}
        Icon={LastUploadIcon}
      />
    </TreeView>
  )
}

export default SmartAlbumTreeView
