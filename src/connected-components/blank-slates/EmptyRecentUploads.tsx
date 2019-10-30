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

function EmptyFavorites({
  albums,
  className,
  dispatchAddAlbum,
}: ComposedProps) {
  const classes = useStyles()

  return (
    <BlankSlate
      className={className}
      headline="No recent uploads"
      type="underConstruction"
    >
      {albums.length > 0 ? (
        <>Uploads from the past 24 hours appepar here.</>
      ) : (
        <>
          Uploads from the past 24 hours appepar here. Create an album and
          upload photos to it to get started.
          <br />
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
)(EmptyFavorites)
