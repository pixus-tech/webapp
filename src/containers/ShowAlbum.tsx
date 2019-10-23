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
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import Slider from '@material-ui/core/Slider'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
  withTheme,
  WithTheme,
} from '@material-ui/core/styles'

import AlbumTitle from 'components/AlbumTitle'
import ImageGrid from 'components/ImageGrid'
import SharePanel from 'components/SharePanel'
import Album from 'models/album'
import Image from 'models/image'
import { saveAlbum, setAlbumImageColumnCount } from 'store/albums/actions'
import { getImages, uploadImagesToAlbum } from 'store/images/actions'
import { albumImagesSelector } from 'store/images/selectors'
import { showModal } from 'store/modal/actions'
import { ModalType } from 'store/modal/types'
import { ShowAlbumURLParameters } from 'utils/routes'
import Illustration from 'components/illustrations'

// TODO: extract color
const lightColor = 'rgba(255, 255, 255, 0.7)'

const styles = (theme: Theme) =>
  createStyles({
    autosizeContainer: {
      height: '100%',
      outline: 0,
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
      padding: theme.spacing(1, 0.5, 0),
    },
    emptyListMessageContainer: {
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      height: '100%',
    },
    emptyListMessageIllustration: {
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(3),
      },
      height: 320,
      maxWidth: 320,
      width: '100%',
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
  dispatchGetImages: (album: Album) => void
  dispatchSaveAlbum: typeof saveAlbum.request
  dispatchSetAlbumImageColumnCount: typeof setAlbumImageColumnCount.request
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
  WithStyles<typeof styles> &
  WithTheme

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
    const { album } = this.props

    if (album !== undefined) {
      this.props.dispatchGetImages(album)
      this.asyncUpdateColumnCount(album)
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const { album } = this.props
    const prevAlbumId = _.get(prevProps.album, '_id')

    if (album !== undefined && album._id !== prevAlbumId) {
      this.props.dispatchGetImages(album)
      this.asyncUpdateColumnCount(album)
    }
  }

  asyncUpdateColumnCount(album: Album) {
    requestAnimationFrame(() => {
      this.setState({
        numberOfImageColumns: album.meta.numberOfImageColumns,
      })
    })
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
    const { album } = this.props
    if (typeof value === 'number' && album) {
      this.setState({ numberOfImageColumns: value })
      this.debouncedSetImageColumnCount(album, value)
    }
  }

  setImageColumnCount = (album: Album, numberOfImageColumns: number) => {
    this.props.dispatchSetAlbumImageColumnCount({ album, numberOfImageColumns })
  }

  debouncedSetImageColumnCount = _.debounce(this.setImageColumnCount, 1000)

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
      theme,
    } = this.props
    const { numberOfImageColumns } = this.state

    if (!album) {
      return <CircularProgress className={classes.progress} size={16} />
    }

    return (
      <div className={classes.container}>
        <AppBar component="div" color="primary" position="static" elevation={1}>
          <Toolbar>
            <Grid container alignItems="flex-start" spacing={1}>
              <Grid item>
                <AlbumTitle album={album} onSave={dispatchSaveAlbum} />
              </Grid>
            </Grid>
          </Toolbar>
          <Toolbar>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <SharePanel
                  onAddUser={this.presentInviteUserModal}
                  users={album.users.map(username => ({ username }))}
                />
              </Grid>
              <Grid item xs />
              <Grid item>
                <Dropzone onDrop={this.onDropFiles}>
                  {({ getInputProps, getRootProps }) => (
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <Button
                        color="secondary"
                        size="small"
                        type="submit"
                        variant="outlined"
                      >
                        Add image
                      </Button>
                    </div>
                  )}
                </Dropzone>
              </Grid>
              <Grid item>
                <Hidden xsDown>
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
                </Hidden>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          <Dropzone onDrop={this.onDropFiles}>
            {({ getInputProps, getRootProps }) => (
              <div className={classes.autosizeContainer} {...getRootProps()}>
                <input {...getInputProps()} />
                {numberOfImages === 0 ? (
                  <div className={classes.emptyListMessageContainer}>
                    <Typography align="center" variant="h6" component="h2">
                      There are no images to show.
                      <br />
                      Click here or drop images to add some.
                    </Typography>
                    <Illustration
                      className={classes.emptyListMessageIllustration}
                      type="emptyList"
                    />
                  </div>
                ) : (
                  <AutoSizer>
                    {({ height, width }) => {
                      if (height === 0 || width === 0) {
                        return null
                      }

                      const columnCount =
                        width <= theme.breakpoints.width('sm')
                          ? 4
                          : numberOfImageColumns

                      return (
                        <ImageGrid
                          album={album}
                          columnCount={columnCount}
                          height={height}
                          images={images}
                          key={album._id}
                          numberOfImages={numberOfImages}
                          width={width}
                        />
                      )
                    }}
                  </AutoSizer>
                )}
              </div>
            )}
          </Dropzone>
        </div>
      </div>
    )
  }
}

function mapStateToProps(store: RootState, props: ComposedProps): IStateProps {
  const album = store.albums.data.get(props.match.params.albumId)
  const images =
    album === undefined ? [] : albumImagesSelector(store, album).toArray()

  return {
    album,
    images,
    numberOfImages: images.length,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchGetImages: (album: Album) => {
      dispatch(
        getImages({
          page: 0,
          perPage: 1000,
          attributes: { userGroupId: album._id },
        }),
      )
    },
    dispatchUploadImagesToAlbum: albumImageFiles =>
      dispatch(uploadImagesToAlbum(albumImageFiles)),
    dispatchSaveAlbum: album => dispatch(saveAlbum.request(album)),
    dispatchSetAlbumImageColumnCount: payload =>
      dispatch(setAlbumImageColumnCount.request(payload)),
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
  withTheme,
)(ShowAlbum)
