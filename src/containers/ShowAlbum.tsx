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

import AppBar from '@material-ui/core/AppBar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import AlbumTitle from 'components/AlbumTitle'
import ImageGrid from 'components/ImageGrid'
import SharePanel from 'components/SharePanel'
import Album from 'models/album'
import Image from 'models/image'
import { saveAlbum } from 'store/albums/actions'
import { getAlbumImages, uploadImagesToAlbum } from 'store/images/actions'
import { albumImagesSelector } from 'store/images/selectors'
import { showModal } from 'store/modal/actions'
import { ModalType } from 'store/modal/types'
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
      padding: theme.spacing(1, 2, 0),
    },
    root: {
      border: '1px solid black',
      marginBottom: theme.spacing(1),
      width: '100%',
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
  dispatchUploadImagesToAlbum: typeof uploadImagesToAlbum
  dispatchGetAlbumImages: typeof getAlbumImages.request
  dispatchSaveAlbum: typeof saveAlbum.request
  dispatchShowModal: (album: Album) => ReturnType<typeof showModal>
}

interface IStateProps {
  album?: Album
  images: Image[]
  numberOfImages: number
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
      numberOfImageColumns: 5,
    }
  }

  componentDidMount() {
    const { album } = this.props

    if (album !== undefined) {
      this.props.dispatchGetAlbumImages(album)
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const { album } = this.props
    const prevAlbumId = _.get(prevProps.album, '_id')

    if (album !== undefined && album._id !== prevAlbumId) {
      this.props.dispatchGetAlbumImages(album)
    }
  }

  onDropFiles = (imageFiles: File[]) => {
    const { album } = this.props

    if (album !== undefined) {
      this.props.dispatchUploadImagesToAlbum({ album, imageFiles })
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

  presentInviteUserModal = () => {
    const { album, dispatchShowModal } = this.props

    if (album !== undefined) {
      dispatchShowModal(album)
    }
  }

  render() {
    const {
      album,
      classes,
      dispatchSaveAlbum,
      images,
      numberOfImages,
    } = this.props
    const { numberOfImageColumns } = this.state

    if (!album) {
      return <CircularProgress className={classes.progress} size={16} />
    }

    return (
      <div className={classes.container}>
        <AppBar component="div" color="primary" position="static" elevation={2}>
          <Toolbar>
            <Grid container alignItems="flex-start" spacing={1}>
              <Grid item>
                <AlbumTitle album={album} onSave={dispatchSaveAlbum} />
              </Grid>
              <Grid item xs>
                <Typography color="inherit" variant="body1" component="p">
                  ({images.length} Images)
                </Typography>
              </Grid>
            </Grid>
          </Toolbar>
          <Toolbar>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <SharePanel
                  onAddUser={this.presentInviteUserModal}
                  users={[
                    {
                      username: 'test1.id.blockstack',
                      name: 'Jon Doe',
                    },
                    {
                      username: 'test2.id.blockstack',
                      imageURL: 'https://picsum.photos/id/1005/5760/3840',
                    },
                    {
                      username: 'test3.id.blockstack',
                    },
                  ]}
                />
              </Grid>
              <Grid item xs />
              <Grid item>
                <Grid container spacing={2}>
                  <Grid item>
                    <Slider
                      className={classes.slider}
                      color="secondary"
                      value={numberOfImageColumns}
                      step={1}
                      min={2}
                      max={10}
                      onChange={this.onChangeImageColumnCount}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          <Dropzone onDrop={this.onDropFiles}>
            {({ getRootProps }) => (
              <div className={classes.autosizeContainer} {...getRootProps()}>
                <AutoSizer>
                  {({ height, width }) => {
                    if (height === 0 || width === 0) {
                      return null
                    }

                    return (
                      <ImageGrid
                        album={album}
                        columnCount={numberOfImageColumns}
                        height={height}
                        images={images}
                        key={album._id}
                        numberOfImages={numberOfImages}
                        width={width}
                      />
                    )
                  }}
                </AutoSizer>
              </div>
            )}
          </Dropzone>
        </div>
      </div>
    )
  }
}

function mapStateToProps(store: RootState, props: ComposedProps): IStateProps {
  const album = store.albums.map.get(props.match.params.albumId)
  const images =
    album === undefined ? [] : albumImagesSelector(store, album).toArray()

  return {
    album,
    images,
    numberOfImages: images.length,
  }
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  return {
    dispatchGetAlbumImages: (album: Album) =>
      dispatch(getAlbumImages.request(album)),
    dispatchUploadImagesToAlbum: albumImageFiles =>
      dispatch(uploadImagesToAlbum(albumImageFiles)),
    dispatchSaveAlbum: album => dispatch(saveAlbum.request(album)),
    dispatchShowModal: (album: Album) =>
      dispatch(showModal({ type: ModalType.InviteUser, props: { album } })),
  }
}

export default compose<ComposedProps, {}>(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(ShowAlbum)
