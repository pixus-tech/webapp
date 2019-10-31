import _ from 'lodash'
import React from 'react'
import Dropzone from 'react-dropzone'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import UploadIcon from '@material-ui/icons/AddAPhoto'

import AlbumView from 'components/AlbumView'
import AlbumTitle from 'components/AlbumTitle'
import ImageGrid from 'components/ImageGrid'
import SharePanel from 'components/SharePanel'
import Album from 'models/album'
import Image, { ImageFilterName } from 'models/image'
import { updateAlbum, setAlbumImageColumnCount } from 'store/albums/actions'
import { getImages, addImagesToAlbum } from 'store/images/actions'
import { albumImagesSelector } from 'store/images/selectors'
import { keyForFilter } from 'store/images/types'
import { showModal } from 'store/modal/actions'
import { ModalType } from 'store/modal/types'
import { ShowAlbumURLParameters } from 'utils/routes'
import { AVATAR_SIZE } from 'components/UserAvatar'
import EmptyAlbum from 'connected-components/blank-slates/EmptyAlbum'
import { preventClickThrough } from 'utils/ui'

const styles = (theme: Theme) =>
  createStyles({
    autosizeContainer: {
      height: '100%',
      outline: 0,
      overflow: 'hidden',
      width: '100%',
    },
    uploadButton: {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '50%',
      color: theme.palette.secondary.contrastText,
      fontSize: 20,
      height: AVATAR_SIZE,
      minHeight: 0,
      minWidth: 0,
      width: AVATAR_SIZE,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    },
  })

interface IDispatchProps {
  dispatchUploadImagesToAlbum: typeof addImagesToAlbum
  dispatchGetImages: (album: Album) => void
  dispatchSetAlbumName: (album: Album, name: string) => void
  dispatchSetAlbumImageColumnCount: typeof setAlbumImageColumnCount.request
  dispatchShowModal: (album: Album) => ReturnType<typeof showModal>
}

interface IStateProps {
  album?: Album
  images: Image[]
  isLoadingImages: boolean
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
    const { numberOfImageColumns } = album.meta

    if (numberOfImageColumns === undefined) {
      return
    }

    requestAnimationFrame(() => {
      this.setState({
        numberOfImageColumns,
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

  onChangeImageColumnCount = (value: number) => {
    const { album } = this.props
    if (album) {
      this.setState({ numberOfImageColumns: value })
      this.debouncedSetImageColumnCount(album, value)
    }
  }

  setImageColumnCount = (album: Album, numberOfImageColumns: number) => {
    this.props.dispatchSetAlbumImageColumnCount({ album, numberOfImageColumns })
  }

  debouncedSetImageColumnCount = _.debounce(this.setImageColumnCount, 1000)

  presentInviteUserModal = (e: React.MouseEvent<HTMLElement>) => {
    preventClickThrough(e)
    const { album, dispatchShowModal } = this.props

    if (album !== undefined) {
      dispatchShowModal(album)
    }
  }

  setAlbumName = (name: string) => {
    const { album, dispatchSetAlbumName } = this.props
    if (album !== undefined) {
      dispatchSetAlbumName(album, name)
    }
  }

  render() {
    const {
      album,
      classes,
      images,
      isLoadingImages,
      numberOfImages,
    } = this.props
    const { numberOfImageColumns } = this.state

    if (!album || isLoadingImages) {
      const title = album ? album.name : 'the album'
      return (
        <AlbumView
          actions={[]}
          isLoading
          numberOfImageColumns={numberOfImageColumns}
          numberOfImages={numberOfImages}
          setNumberOfImageColumns={this.onChangeImageColumnCount}
          title={title}
        />
      )
    }

    return (
      <AlbumView
        actions={[
          <Dropzone onDrop={this.onDropFiles} key="dropzone">
            {({ getInputProps, getRootProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Tooltip title="Add photos to this album">
                  <Button
                    className={classes.uploadButton}
                    color="secondary"
                    type="submit"
                  >
                    <UploadIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
              </div>
            )}
          </Dropzone>,
          <SharePanel
            key="share-panel"
            onAddUser={this.presentInviteUserModal}
            users={album.users.map(username => ({ username }))}
          />,
        ]}
        isLoading={false}
        numberOfImageColumns={numberOfImageColumns}
        numberOfImages={numberOfImages}
        setNumberOfImageColumns={this.onChangeImageColumnCount}
        title={<AlbumTitle album={album} onSetName={this.setAlbumName} />}
      >
        <Dropzone onDrop={this.onDropFiles}>
          {({ getInputProps, getRootProps }) => (
            <div className={classes.autosizeContainer} {...getRootProps()}>
              <input {...getInputProps()} />
              {numberOfImages === 0 ? (
                <EmptyAlbum inviteUsers={this.presentInviteUserModal} />
              ) : (
                <ImageGrid
                  columnCount={numberOfImageColumns}
                  images={images}
                  key={album._id}
                  numberOfImages={numberOfImages}
                />
              )}
            </div>
          )}
        </Dropzone>
      </AlbumView>
    )
  }
}

function albumFilter(album: Album) {
  return {
    page: 0,
    perPage: 1000,
    filter: {
      name: 'album' as ImageFilterName,
      data: album._id,
    },
  }
}

function mapStateToProps(store: RootState, props: ComposedProps): IStateProps {
  const { albumId } = props.match.params
  const album = store.albums.data.get(albumId)
  const isLoadingImages = album
    ? !store.images.filterImagesLoaded.get(keyForFilter(albumFilter(album)))
    : true
  const images =
    album === undefined ? [] : albumImagesSelector(store, album).toArray()

  return {
    album,
    images,
    isLoadingImages,
    numberOfImages: images.length,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchGetImages: (album: Album) => {
      dispatch(getImages(albumFilter(album)))
    },
    dispatchUploadImagesToAlbum: albumImageFiles =>
      dispatch(addImagesToAlbum(albumImageFiles)),
    dispatchSetAlbumName: (album, name) => {
      dispatch(updateAlbum.request({ album, updates: { name } }))
    },
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
)(ShowAlbum)
