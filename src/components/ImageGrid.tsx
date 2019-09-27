import React from 'react'
import { Grid, GridCellRenderer } from 'react-virtualized'
import { compose } from 'recompose'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import LazyImage from 'connected-components/LazyImage'
import Album from 'models/album'
import Image from 'models/image'
import { IMAGE_GRID_GUTTER_SIZE } from 'constants/index'

const styles = (_theme: Theme) =>
  createStyles({
    cell: {
      overflow: 'hidden',
      paddingBottom: IMAGE_GRID_GUTTER_SIZE,
      paddingRight: IMAGE_GRID_GUTTER_SIZE,
    },
  })

interface IProps {
  album: Album
  columnCount: number
  images: Image[]
  width: number
  height: number
}

type ComposedProps = IProps & WithStyles<typeof styles>

class ImageGrid extends React.PureComponent<ComposedProps> {
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
      <div className={classes.cell} key={key} style={style}>
        <LazyImage album={album} image={image} isVisible={isVisible} />
      </div>
    )
  }

  render() {
    const { columnCount, images, height, width } = this.props
    const cellWidth = width / columnCount
    const cellHeight = cellWidth

    return (
      <Grid
        cellRenderer={this.renderCell}
        columnCount={columnCount}
        columnWidth={cellWidth}
        height={height}
        rowCount={Math.ceil(images.length / columnCount)}
        rowHeight={cellHeight}
        width={width}
      />
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(ImageGrid)
