import _ from 'lodash'
import React from 'react'
import Dropzone from 'react-dropzone'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'
import { AutoSizer } from 'react-virtualized'

import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'
import withImmutablePropsToJS from 'with-immutable-props-to-js'

import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import HelpIcon from '@material-ui/icons/Help'
import IconButton from '@material-ui/core/IconButton'
import Slider from '@material-ui/core/Slider'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import PhotoSizeUp from '@material-ui/icons/PhotoSizeSelectLarge'
import PhotoSizeDown from '@material-ui/icons/PhotoSizeSelectSmall'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import ImageGrid from 'components/ImageGrid'
import Album from 'models/album'
import Image from 'models/image'
import { addImageFilesToAlbum, getImages } from 'store/images/actions'
import { ShowAlbumURLParameters } from 'utils/routes'

// TODO: extract color
const lightColor = 'rgba(255, 255, 255, 0.7)'

const styles = (theme: Theme) =>
  createStyles({
    autosizeContainer: {
      height: '100%',
      overflow: 'hidden',
      width: '100%',
    },
    button: {
      borderColor: lightColor,
    },
    container: {
      height: '100%',
      overflow: 'hidden',
    },
    secondaryBar: {
      zIndex: 0,
    },
    root: {
      border: '1px solid black',
      marginBottom: theme.spacing(1),
      width: '100%',
    },
    center: {
      textAlign: 'center',
    },
    leftRightContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: `${theme.spacing(2)}px 0`,
    },
    progress: {},
    spacer: {
      display: 'inline-block',
      width: '1cm',
    },
    slider: {
      width: 100,
    },
  })

interface IDispatchProps {
  dispatchAddImageFilesToAlbum: typeof addImageFilesToAlbum
  dispatchGetImages: typeof getImages.request
}

interface IStateProps {
  album?: Album
  images: { [id: string]: Image }
}

type ComposedProps = RouteComponentProps<ShowAlbumURLParameters> &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

interface IState {
  numberOfImageColumns: number
}

class ShowAlbum extends React.PureComponent<ComposedProps, IState> {
  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      numberOfImageColumns: 6,
    }
  }

  componentDidMount() {
    this.props.dispatchGetImages()

    const { match, album } = this.props

    if (!album) {
      /* this.props.dispatchFindGMA({
       *   number: match.params.gma,
       * }) */
    }
  }

  onDropFiles = (imageFiles: File[]) => {
    const { album } = this.props

    if (album !== undefined) {
      this.props.dispatchAddImageFilesToAlbum({ album, imageFiles })
    } else {
      // TODO: Error handling
    }
  }

  onChangeImageColumnCount = (
    _event: React.ChangeEvent<{}>,
    value: number | number[],
  ) => {
    if (typeof value === 'number') {
      // TODO: Throttle the event
      this.setState({ numberOfImageColumns: value })
    }
  }

  render() {
    const { album, classes, images } = this.props
    const { numberOfImageColumns } = this.state

    if (!album) {
      return <CircularProgress className={classes.progress} size={16} />
    }

    return (
      <div className={classes.container}>
        <AppBar
          component="div"
          className={classes.secondaryBar}
          color="primary"
          position="static"
          elevation={0}
        >
          <Toolbar>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs>
                <Typography color="inherit" variant="h5" component="h1">
                  {album.name}
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  className={classes.button}
                  variant="outlined"
                  color="inherit"
                  size="small"
                >
                  Web setup
                </Button>
              </Grid>
              <Grid item>
                <Tooltip title="Help">
                  <IconButton color="inherit">
                    <HelpIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <AppBar
          component="div"
          className={classes.secondaryBar}
          color="primary"
          position="static"
          elevation={0}
        >
          <Toolbar>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs>
                <Typography color="inherit" variant="body1" component="p">
                  foo
                </Typography>
              </Grid>
              <Grid item>
                <Grid container spacing={2}>
                  <Grid item>
                    <PhotoSizeDown />
                  </Grid>
                  <Grid item>
                    <Slider
                      className={classes.slider}
                      color="secondary"
                      value={numberOfImageColumns}
                      marks
                      step={1}
                      min={2}
                      max={10}
                      onChange={this.onChangeImageColumnCount}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item>
                    <PhotoSizeUp />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Dropzone onDrop={this.onDropFiles}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
        <div className={classes.autosizeContainer}>
          <AutoSizer>
            {({ height, width }) => {
              if (height === 0 || width === 0) {
                return null
              }

              return (
                <ImageGrid
                  columnCount={numberOfImageColumns}
                  height={height}
                  images={_.values(images)}
                  width={width}
                />
              )
            }}
          </AutoSizer>
        </div>
      </div>
    )
  }
}

function mapStateToProps(store: RootState, props: ComposedProps) {
  const album = store.albums.map.get(props.match.params.albumId)
  const images = store.images.map

  return {
    album,
    images,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchAddImageFilesToAlbum: albumImageFiles =>
      dispatch(addImageFilesToAlbum(albumImageFiles)),
    dispatchGetImages: () => dispatch(getImages.request()),
  }
}

export default compose<ComposedProps, {}>(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withImmutablePropsToJS,
  withStyles(styles),
)(ShowAlbum)
