import cx from 'classnames'
import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'

import { PreviewColors } from 'models/image'

export interface IProps {
  className?: string
  colors: PreviewColors
}

const useStyles = makeStyles(
  createStyles({
    container: {
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    gradient: {
      height: '100%',
      position: 'absolute',
      width: '100%',
      top: 0,
      left: 0,
    },
  }),
)

function ImagePreviewGradient({ className, colors }: IProps) {
  const classes = useStyles()

  const { tl, tr, bl, br, c } = colors

  const styles = {
    tl: {
      backgroundImage: `linear-gradient(135deg, rgba(${tl.join(
        ',',
      )}) 0%, transparent 60%)`,
    },
    tr: {
      backgroundImage: `linear-gradient(225deg, rgba(${tr.join(
        ',',
      )}) 0%, transparent 60%)`,
    },
    bl: {
      backgroundImage: `linear-gradient(45deg, rgba(${bl.join(
        ',',
      )}) 0%, transparent 60%)`,
    },
    br: {
      backgroundImage: `linear-gradient(315deg, rgba(${br.join(
        ',',
      )}) 0%, transparent 60%)`,
    },
    c: {
      backgroundImage: `radial-gradient(circle, rgba(${c.join(
        ',',
      )}) 0%, transparent 60%)`,
    },
  }

  return (
    <div className={cx(className, classes.container)}>
      <div className={classes.gradient} style={styles.c} />
      <div className={classes.gradient} style={styles.tl} />
      <div className={classes.gradient} style={styles.tr} />
      <div className={classes.gradient} style={styles.bl} />
      <div className={classes.gradient} style={styles.br} />
    </div>
  )
}

export default ImagePreviewGradient
