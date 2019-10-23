import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'

declare module 'csstype' {
  interface Properties {
    '--tree-view-color'?: string
    '--tree-view-bg-color'?: string
  }
}

export const treeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: 'rgba(255, 255, 255, 0.7)',
      '&:focus > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.primary.main})`,
        color: 'var(--tree-view-color)',
      },
    },
    icon: {
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
