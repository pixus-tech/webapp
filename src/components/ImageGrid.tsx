import React from 'react'
import {
  CellRenderer,
  CellMeasurer,
  CellMeasurerCache,
  Positioner,
  createMasonryCellPositioner,
  Masonry,
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
import { IMAGE_GRID_GUTTER_SIZE } from 'constants/index'

const styles = (_theme: Theme) =>
  createStyles({
    cell: {
      overflow: 'hidden',
    },
    collection: {},
  })

interface IProps {
  columnCount: number
  images: Image[]
  width: number
  height: number
}

interface IState {
  cellMeasurerCache: CellMeasurerCache
  cellPositioner: Positioner
  prevColumnCount: number
}

type ComposedProps = IProps & WithStyles<typeof styles>

class ImageGrid extends React.PureComponent<ComposedProps, IState> {
  static buildMeasurerCacheAndPositioner(width: number, columnCount: number) {
    const defaultWidth = (width - (columnCount - 1) * IMAGE_GRID_GUTTER_SIZE) / columnCount
    const defaultHeight = (defaultWidth * 2) / 3

    const cellMeasurerCache = new CellMeasurerCache({
      defaultHeight,
      defaultWidth,
      fixedWidth: true,
    })

    return {
      cellMeasurerCache,
      cellPositioner: createMasonryCellPositioner({
        cellMeasurerCache,
        columnCount,
        columnWidth: defaultWidth,
        spacer: IMAGE_GRID_GUTTER_SIZE,
      }),
    }
  }

  static getDerivedStateFromProps(props: ComposedProps, state: IState) {
    // Re-run the filter whenever the list array or filter text change.
    // Note we need to store prevPropsList and prevFilterText to detect changes.
    if (props.columnCount !== state.prevColumnCount) {
      return {
        ...ImageGrid.buildMeasurerCacheAndPositioner(
          props.width,
          props.columnCount,
        ),
        prevColumnCount: props.columnCount,
      }
    }
    return null
  }

  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      ...ImageGrid.buildMeasurerCacheAndPositioner(
        props.width,
        props.columnCount,
      ),
      prevColumnCount: props.columnCount,
    }
  }
  renderCell: CellRenderer = ({ index, key, parent, style }) => {
    const { classes, images } = this.props
    const { cellMeasurerCache } = this.state

    const image = images[index % images.length]
    const width = cellMeasurerCache.defaultWidth
    const height = Math.round((width / image.width) * image.height)

    return (
      <CellMeasurer
        cache={cellMeasurerCache}
        index={index}
        key={image._id}
        parent={parent}
      >
        <div className={classes.cell} key={key} style={style}>
          <LazyImage image={image} width={width} height={height} />
        </div>
      </CellMeasurer>
    )
  }

  render() {
    const { columnCount, images, height, width } = this.props
    const { cellMeasurerCache, cellPositioner } = this.state

    return (
      <Masonry
        autoHeight={true}
        cellCount={images.length}
        cellMeasurerCache={cellMeasurerCache}
        cellPositioner={cellPositioner}
        cellRenderer={this.renderCell}
        height={height}
        key={columnCount}
        width={width}
      />
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(ImageGrid)
