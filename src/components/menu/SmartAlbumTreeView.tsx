import React from 'react'

import { makeStyles, createStyles } from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'

import FavoritesIcon from '@material-ui/icons/Star'
import LastUploadIcon from '@material-ui/icons/History'

import SmartAlbumTreeItem from './SmartAlbumTreeItem'

const useStyles = makeStyles(
  createStyles({
    root: {},
  }),
)

const SmartAlbumTreeView: React.SFC = ({}) => {
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
        targetPath="/"
        Icon={FavoritesIcon}
      />
      <SmartAlbumTreeItem
        title="Last Upload"
        targetPath="/"
        Icon={LastUploadIcon}
      />
    </TreeView>
  )
}

export default SmartAlbumTreeView
