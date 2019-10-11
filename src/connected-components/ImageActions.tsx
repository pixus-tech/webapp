import cx from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import Image from 'models/image'

import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/DeleteOutline'
import DownloadIcon from '@material-ui/icons/SaveAlt'

import { showModal } from 'store/modal/actions'
import { ModalType } from 'store/modal/types'

const styles = (theme: Theme) =>
  createStyles({
    container: {
      alignItems: 'flex-start',
      display: 'flex',
      justifyContent: 'flex-end',
      padding: theme.spacing(1),
    },
    button: {
      color: theme.palette.common.white,
    },
  })

export interface IProps {
  className?: string
  image: Image
}

interface IDispatchProps {
  requestImageDeletion: () => void
}

type ComposedProps = IProps & IDispatchProps & WithStyles<typeof styles>

class ImageActions extends React.PureComponent<ComposedProps> {
  requestImageDownload = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  requestImageDeletion = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    this.props.requestImageDeletion()
  }

  render() {
    const { classes, className } = this.props

    return (
      <div className={cx(classes.container, className)}>
        <Tooltip title="Download decrypted file to your computer">
          <IconButton
            className={classes.button}
            color="secondary"
            onClick={this.requestImageDownload}
            aria-label="download"
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Permanently delete file">
          <IconButton
            className={classes.button}
            color="secondary"
            onClick={this.requestImageDeletion}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}

function mapDispatchToProps(
  dispatch: Dispatch<RootAction>,
  props: ComposedProps,
): IDispatchProps {
  const { image } = props

  return {
    requestImageDeletion: () => {
      dispatch(
        showModal({ type: ModalType.ConfirmImageDeletion, props: { image } }),
      )
    },
  }
}

export default compose<ComposedProps, IProps>(
  connect<undefined, IDispatchProps, ComposedProps, RootState>(
    undefined,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(ImageActions)
