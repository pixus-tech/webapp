import React from 'react'

import AppBar from '@material-ui/core/AppBar'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import Slider from '@material-ui/core/Slider'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import LoadingList from 'connected-components/blank-slates/LoadingList'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    center: {
      textAlign: 'center',
    },
    container: {
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexFlow: 'column',
    },
    content: {
      background: theme.palette.primary.main,
      flex: 1,
      padding: theme.spacing(1, 0.5, 0),
    },
    slider: {
      width: 100,
    },
    sliderWrapper: {
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      height: '100%',
    },
  }),
)

interface IProps {
  actions: React.ReactNode[]
  children?: React.ReactNode
  isLoading: boolean
  numberOfImageColumns: number
  numberOfImages: number
  setNumberOfImageColumns: (nextNumber: number) => void
  title: React.ReactNode
}

function AlbumView({
  actions,
  children,
  isLoading,
  title,
  numberOfImageColumns,
  numberOfImages,
  setNumberOfImageColumns,
}: IProps) {
  const classes = useStyles()

  if (isLoading) {
    return (
      <div className={classes.container}>
        <LoadingList />
      </div>
    )
  }

  const onChangeImageColumnCount = (
    _event: React.ChangeEvent<{}>,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      setNumberOfImageColumns(10 - value)
    }
  }

  return (
    <div className={classes.container}>
      <AppBar component="div" color="primary" position="static" elevation={1}>
        <Toolbar>
          <Grid container alignItems="flex-start" spacing={1}>
            <Grid item>
              {typeof title === 'string' ? (
                <Typography color="inherit" variant="h5" component="h1">
                  {title}
                </Typography>
              ) : (
                title
              )}
            </Grid>
          </Grid>
        </Toolbar>
        <Toolbar>
          <Grid container alignItems="center" spacing={1}>
            {actions.map((action, index) => (
              <Grid item key={index}>
                {action}
              </Grid>
            ))}
            <Grid item xs />
            {numberOfImages > 0 && (
              <Hidden xsDown>
                <Grid item>
                  <Grid container spacing={2}>
                    <Grid item>
                      <div className={classes.sliderWrapper}>
                        <Typography
                          color="inherit"
                          variant="body2"
                          component="span"
                        >
                          Zoom
                        </Typography>
                        <Slider
                          className={classes.slider}
                          color="secondary"
                          value={10 - numberOfImageColumns}
                          step={1}
                          min={2}
                          max={8}
                          onChange={onChangeImageColumnCount}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Hidden>
            )}
          </Grid>
        </Toolbar>
      </AppBar>
      <div className={classes.content}>{children}</div>
    </div>
  )
}

export default AlbumView
