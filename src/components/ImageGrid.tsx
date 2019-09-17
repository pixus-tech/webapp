import React from 'react'
import {
  AutoSizer,
  Collection,
  CollectionCellRendererParams,
  Index,
} from 'react-virtualized'
import { compose } from 'recompose'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import LazyImage from './LazyImage'
import Image from 'models/image'

const styles = (_theme: Theme) =>
  createStyles({
    cell: {
      overflow: 'hidden',
    },
    collection: {},
  })

// TODO: extract into props
const GUTTER_SIZE = 3

interface IProps {
  columnCount: number
  images: Image[]
}

interface IState {}

type ComposedProps = IProps & WithStyles<typeof styles>

class ImageGrid extends React.PureComponent<ComposedProps, IState> {
  private columnMap: { [key: number]: number } = {}

  renderCell = ({ index, key, style }: CollectionCellRendererParams) => {
    const { classes, images } = this.props

    // Customize style
    const image = images[index % images.length]
    // style.backgroundColor = datum.color;

    return (
      <div className={classes.cell} key={key} style={style}>
        <LazyImage image={image} />
      </div>
    )
  }

  renderPlaceholder = () => {
    return <div>No cells</div>
  }

  cellSizeAndPosition = (containerWidth: number) => ({ index }: Index) => {
    const { columnCount, images } = this.props

    const columnPosition = index % columnCount
    // const datum = imageList[index % imageList.length]

    // Poor man's Masonry layout; columns won't all line up equally with the bottom.
    const width =
      (containerWidth - (columnCount - 1) * GUTTER_SIZE) / columnCount
    const height = (width * 2) / 3
    const x = columnPosition * (GUTTER_SIZE + width)
    const y = this.columnMap[columnPosition] || 0

    this.columnMap[columnPosition] = y + height + GUTTER_SIZE

    return {
      height,
      width,
      x,
      y,
    }
  }

  render() {
    const { classes, images } = this.props

    return (
      <AutoSizer>
        {({ height, width }) => {
          if (height === 0 || width === 0) {
            return null
          }

          return (
            <Collection
              cellCount={images.length}
              cellRenderer={this.renderCell}
              cellSizeAndPositionGetter={this.cellSizeAndPosition(width)}
              className={classes.collection}
              height={height}
              horizontalOverscanSize={0}
              noContentRenderer={this.renderPlaceholder}
              verticalOverscanSize={0}
              width={width}
            />
          )
        }}
      </AutoSizer>
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(ImageGrid)
