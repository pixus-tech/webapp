import React from 'react'
import cx from 'classnames'

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { ReactComponent as NoConnection } from './assets/pluto-no-connection.svg'
import { ReactComponent as EmptyList } from './assets/list-is-empty-3.svg'
import colors from 'constants/colors'

const illustrations = {
  emptyList: EmptyList,
  noConnection: NoConnection,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      '--illu-bg--light': colors.black.light,
      '--illu-bg--main': colors.black.main,
      '--illu-bg--dark': colors.black.dark,
      '--illu-white--light': colors.white.light,
      '--illu-white--main': colors.white.main,
      '--illu-white--dark': colors.white.dark,
      '--illu-blue--light': colors.blue.light,
      '--illu-blue--main': colors.blue.main,
      '--illu-blue--dark': colors.blue.dark,
      '--illu-red--light': colors.red.light,
      '--illu-red--main': colors.red.main,
      '--illu-red--dark': colors.red.dark,
      '--illu-yellow--light': colors.yellow.light,
      '--illu-yellow--main': colors.yellow.main,
      '--illu-yellow--dark': colors.yellow.dark,
      '--illu-green--light': colors.green.light,
      '--illu-green--main': colors.green.main,
      '--illu-green--dark': colors.green.dark,
      '--illu-brown--light': colors.brown.light,
      '--illu-brown--main': colors.brown.main,
      '--illu-brown--dark': colors.brown.dark,
    },
    button: {
      marginTop: theme.spacing(1),
    },
    icon: {
      height: 64,
      width: 64,
    },
  }),
)

interface IProps {
  className?: string
  type: keyof typeof illustrations
}

function Illustration({ className, type }: IProps) {
  const classes = useStyles()

  const IllustrationSVG = illustrations[type]

  return (
    <div className={cx(classes.root, className)}>
      <IllustrationSVG />
    </div>
  )
}

export default Illustration
