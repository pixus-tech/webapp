import React from 'react'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import AlbumView from 'components/AlbumView'
import ImageGrid from 'components/ImageGrid'
import Image from 'models/image'
import { ImageFilterName } from 'models/image'
import { getImages } from 'store/images/actions'
import { filteredImagesSelector } from 'store/images/selectors'
import { keyForFilter } from 'store/images/types'
import { ShowSmartAlbumURLParameters } from 'utils/routes'
import Illustration from 'components/illustrations'

const styles = (theme: Theme) =>
  createStyles({
    autosizeContainer: {
      height: '100%',
      outline: 0,
      overflow: 'hidden',
      width: '100%',
    },
    messageContainer: {
      alignItems: 'center',
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      height: '100%',
    },
    messageIllustration: {
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(1),
      },
      height: 320,
      maxWidth: 320,
      width: '100%',
    },
  })

interface IDispatchProps {
  dispatchGetImages: () => void
}

interface IStateProps {
  images: Image[]
  isLoadingImages: boolean
  numberOfImages: number
}

type ComposedProps = RouteComponentProps<ShowSmartAlbumURLParameters> &
  IDispatchProps &
  IStateProps &
  WithStyles<typeof styles>

interface IState {
  numberOfImageColumns: number
}

class ShowSmartAlbum extends React.Component<ComposedProps, IState> {
  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      numberOfImageColumns: 6,
    }
  }

  componentDidMount() {
    this.props.dispatchGetImages()
  }

  componentDidUpdate(prevProps: ComposedProps) {
    const { filterName } = this.props.match.params

    if (filterName !== prevProps.match.params.filterName) {
      this.props.dispatchGetImages()
    }
  }

  onChangeImageColumnCount = (value: number) => {
    this.setState({ numberOfImageColumns: value })
  }

  shouldComponentUpdate(nextProps: ComposedProps, nextState: IState) {
    const { match, numberOfImages } = this.props
    const { numberOfImageColumns } = this.state
    const { filterName } = match.params

    return (
      numberOfImages !== nextProps.numberOfImages ||
      filterName !== nextProps.match.params.filterName ||
      numberOfImageColumns !== nextState.numberOfImageColumns
    )
  }

  render() {
    const {
      classes,
      images,
      isLoadingImages,
      match,
      numberOfImages,
    } = this.props
    const { numberOfImageColumns } = this.state
    const { filterName } = match.params

    let albumName = 'The album is loading.'
    switch (filterName) {
      case 'favorites':
        albumName = 'Favorites'
        break
      case 'recent-uploads':
        albumName = 'Recent Uploads'
        break
      default:
    }

    if (isLoadingImages) {
      return (
        <AlbumView
          actions={[]}
          isLoading
          numberOfImageColumns={numberOfImageColumns}
          numberOfImages={numberOfImages}
          setNumberOfImageColumns={this.onChangeImageColumnCount}
          title={albumName}
        />
      )
    }

    return (
      <AlbumView
        actions={[]}
        isLoading={false}
        numberOfImageColumns={numberOfImageColumns}
        numberOfImages={numberOfImages}
        setNumberOfImageColumns={this.onChangeImageColumnCount}
        title={albumName}
      >
        {numberOfImages === 0 ? (
          <div className={classes.messageContainer}>
            <Typography align="center" variant="h6" component="h2">
              There are no images to show.
              <br />
              Click here or drop images to add some.
            </Typography>
            <Illustration
              className={classes.messageIllustration}
              type="emptyList"
            />
          </div>
        ) : (
          <ImageGrid
            columnCount={numberOfImageColumns}
            images={images}
            key={albumName}
            numberOfImages={numberOfImages}
          />
        )}
      </AlbumView>
    )
  }
}

function smartFilter(filterName: ImageFilterName) {
  let data: any

  return {
    page: 0,
    perPage: 1000,
    filter: {
      name: filterName,
      data,
    },
  }
}

function mapStateToProps(store: RootState, props: ComposedProps): IStateProps {
  const { filterName } = props.match.params
  const filter = smartFilter(filterName)
  const isLoadingImages = !store.images.filterImagesLoaded.get(
    keyForFilter(filter),
  )
  const images = filteredImagesSelector(store, filter.filter).toArray()

  return {
    images,
    isLoadingImages,
    numberOfImages: images.length,
  }
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  const { filterName } = props.match.params
  return {
    dispatchGetImages: () => {
      dispatch(getImages(smartFilter(filterName)))
    },
  }
}

export default compose<ComposedProps, {}>(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(ShowSmartAlbum)
