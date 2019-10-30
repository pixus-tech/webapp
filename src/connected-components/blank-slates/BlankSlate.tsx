import React from 'react'
import cx from 'classnames'

import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Illustration, { IllustrationType } from 'components/illustrations'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(2),
      },
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
      marginTop: theme.spacing(16),
    },
    text: {
      maxWidth: 468,
      margin: theme.spacing(1, 0, 4),
    },
    illustration: {
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(1),
      },
      maxWidth: 320,
      width: '100%',
    },
  }),
)

interface IProps {
  children?: JSX.Element | JSX.Element[]
  className?: string
  headline: string | JSX.Element
  type: IllustrationType
}

function BlankSlate({ children, className, headline, type }: IProps) {
  const classes = useStyles()

  return (
    <div className={cx(classes.container, className)}>
      <Typography align="center" variant="h4" component="h2">
        {headline}
      </Typography>
      <Typography
        align="center"
        variant="body1"
        component="div"
        className={classes.text}
      >
        {children}
      </Typography>
      <Illustration className={classes.illustration} type={type} />
    </div>
  )
}

export default BlankSlate
