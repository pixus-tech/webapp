import React from 'react'
import { Grid, GridCellRenderer } from 'react-virtualized'
import { compose } from 'recompose'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import LazyPreviewImage from 'connected-components/LazyPreviewImage'
import Slideshow from 'components/Slideshow'
import Album from 'models/album'
import Image from 'models/image'

const styles = (theme: Theme) =>
  createStyles({
    cell: {
      cursor: 'pointer',
      overflow: 'hidden',
      padding: theme.spacing(0, 0.5, 1, 0.5),
    },
    hideScrollbar: {
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      msOverflowStyle: 'none',
      overflow: '-moz-scrollbars-none',
      scrollbarWidth: 'none',
    },
  })

interface IProps {
  album: Album
  columnCount: number
  height: number
  images: Image[]
  numberOfImages: number
  width: number
}

interface IState {
  selection?: number
}

type ComposedProps = IProps & WithStyles<typeof styles>

class ImageGrid extends React.PureComponent<ComposedProps, IState> {
  private gridRef = React.createRef<Grid>()

  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      selection: undefined,
    }
  }

  updateGrid = () => {
    const gridRef = this.gridRef.current
    if (gridRef !== null) {
      gridRef.forceUpdate()
    }
  }

  setCellSelection = (event: React.MouseEvent<HTMLElement>) => {
    const { index } = event.currentTarget.dataset
    if (typeof index === 'string') {
      this.setState({
        selection: parseInt(index, 10),
      })
    }
  }

  renderCell: GridCellRenderer = ({
    columnIndex,
    isVisible,
    key,
    rowIndex,
    style,
  }) => {
    const { album, columnCount, classes, images } = this.props

    const index = columnIndex + rowIndex * columnCount

    if (index >= images.length) {
      return null
    }

    const image = images[index]

    return (
      <div
        className={classes.cell}
        data-index={index}
        key={key}
        onClick={this.setCellSelection}
        style={style}
      >
        <LazyPreviewImage
          showActions={true}
          album={album}
          image={image}
          isVisible={isVisible}
        />
      </div>
    )
  }

  componentDidUpdate(prevProps: ComposedProps) {
    if (
      prevProps.album._id === this.props.album._id &&
      prevProps.numberOfImages !== this.props.numberOfImages
    ) {
      this.updateGrid()
    }
  }

  clearSelection = () => {
    this.setState({ selection: undefined })
  }

  render() {
    const { album, classes, columnCount, images, height, width } = this.props
    const { selection } = this.state

    const cellWidth = width / columnCount
    const cellHeight = cellWidth

    return (
      <>
        <Grid
          cellRenderer={this.renderCell}
          className={classes.hideScrollbar}
          columnCount={columnCount}
          columnWidth={cellWidth}
          height={height}
          ref={this.gridRef}
          rowCount={Math.ceil(images.length / columnCount)}
          rowHeight={cellHeight}
          style={{ overflowX: 'hidden' }}
          width={width}
        />
        {selection !== undefined && (
          <Slideshow
            album={album}
            images={images}
            initialSlide={selection}
            onClose={this.clearSelection}
          />
        )}
      </>
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(ImageGrid)
