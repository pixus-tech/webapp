import React from 'react'
import { NavLink } from 'react-router-dom'

import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography'

import { treeItemStyles } from './styles'
import { SvgIconProps } from '@material-ui/core/SvgIcon'
import { preventClickThrough } from 'utils/ui'

interface IProps {
  Icon?: (props: SvgIconProps) => JSX.Element
  targetPath: string
  title: string
}

const SmartAlbumTreeItem: React.SFC<IProps> = ({
  children,
  Icon,
  targetPath,
  title,
}) => {
  const classes = treeItemStyles()

  return (
    <TreeItem
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      label={
        <div className={classes.labelRoot} onClick={preventClickThrough}>
          <NavLink
            activeClassName={classes.linkActive}
            className={classes.link}
            to={targetPath}
          >
            {Icon && <Icon className={classes.icon} />}
            <Typography variant="body1">{title}</Typography>
          </NavLink>
        </div>
      }
      nodeId={title}
    >
      {children}
    </TreeItem>
  )
}

export default SmartAlbumTreeItem
