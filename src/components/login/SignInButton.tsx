import React from 'react'
import cx from 'classnames'

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import { ReactComponent as BlockstackButton } from './assets/blockstack-button.svg'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      '--foreground': theme.palette.secondary.contrastText,
      '--background': theme.palette.secondary.main,
      '&:hover': {
        '--background': theme.palette.secondary.dark,
      },
    },
  }),
)

interface IProps {
  className?: string
  onClick?: () => void
}

function SignInButton({ className, onClick }: IProps) {
  const classes = useStyles()

  return (
    <div className={cx(classes.root, className)} onClick={onClick}>
      <BlockstackButton />
    </div>
  )
}

export default SignInButton
