import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import Button from '@material-ui/core/Button'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Album from 'models/album'
import BlankSlate from './BlankSlate'
import { addAlbum } from 'store/albums/actions'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      marginTop: theme.spacing(2),
    },
  }),
)

interface IProps {
  className?: string
}

interface IDispatchProps {
  dispatchAddAlbum: () => void
}

interface IStateProps {
  albums: Album[]
}

type ComposedProps = IProps & IDispatchProps & IStateProps

function EmptyRecentUploads({
  albums,
  className,
  dispatchAddAlbum,
}: ComposedProps) {
  const classes = useStyles()

  return (
    <BlankSlate
      className={className}
      headline="Favorites are empty"
      type="comingSoon"
    >
      {albums.length > 0 ? (
        <>
          Open an album and click the star in the upper right corner of images
          to add them to your favorites.
        </>
      ) : (
        <>
          Create an album, upload images to it and click the star in the upper
          right corner of images to add them to your favorites.
          <Button
            className={classes.button}
            variant="outlined"
            color="secondary"
            onClick={dispatchAddAlbum}
          >
            Create an album
          </Button>
        </>
      )}
    </BlankSlate>
  )
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    albums: store.albums.data.toList().toArray(),
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchAddAlbum: () => {
      dispatch(addAlbum.request({ isDirectory: false }))
    },
  }
}

export default compose<ComposedProps, IProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(EmptyRecentUploads)
