import React from 'react'
import Hotkeys from 'react-hot-keys'
import { compose } from 'recompose'

import { Formik, FormikProps, Field, FieldProps } from 'formik'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import SaveIcon from '@material-ui/icons/Save'
import EditIcon from '@material-ui/icons/Edit'

import Album, { validationSchema } from 'models/album'

const styles = (theme: Theme) =>
  createStyles({
    editButton: {
      minWidth: 0,
      color: 'inherit',
    },
    root: {
      display: 'flex',
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    textField: {
      color: 'inherit',
    },
    input: {
      ...theme.typography.h5,
      color: 'inherit',
      padding: '1px 0 0',
    },
    underline: {
      '&:after': {
        borderBottom: `2px solid ${theme.palette.common.white}`,
      },
      '&:before': {
        borderBottom: `1px solid ${theme.palette.common.white}`,
      },
    },
    saveIcon: {
      marginLeft: theme.spacing(1),
    },
    saveButton: {
      minWidth: 0,
      color: 'inherit',
    },
  })

interface IProps {
  album: Album
  onSetName: (name: string) => void
}

type ComposedProps = IProps & WithStyles<typeof styles>

interface IState {
  isEditing: boolean
}

class AlbumTitle extends React.Component<ComposedProps, IState> {
  constructor(props: ComposedProps) {
    super(props)

    this.state = {
      isEditing: false,
    }
  }

  componentDidUpdate(prevProps: ComposedProps) {
    if (prevProps.album._id !== this.props.album._id) {
      this.endEditing()
    }
  }

  beginEditing = () => {
    this.setState({ isEditing: true })
  }

  endEditing = () => {
    this.setState({ isEditing: false })
  }

  setName = (name: string) => {
    this.props.onSetName(name)
    this.endEditing()
  }

  render() {
    const { album, classes } = this.props
    const { isEditing } = this.state

    if (isEditing) {
      return (
        <Hotkeys filter={() => true} keyName="esc" onKeyUp={this.endEditing}>
          <Formik
            initialValues={{ name: album.name }}
            validationSchema={validationSchema}
            onSubmit={({ name }, actions) => {
              if (name !== undefined) {
                this.setName(name)
              }
              actions.setSubmitting(false)
            }}
          >
            {({
              handleSubmit,
              isSubmitting,
              isValid,
            }: FormikProps<Partial<Album>>) => (
              <form className={classes.root} onSubmit={handleSubmit}>
                <Field name="name">
                  {({ field, form }: FieldProps) => {
                    const errorMessage =
                      form.touched[field.name] && form.errors[field.name]
                        ? form.errors[field.name]
                        : undefined
                    return (
                      <TextField
                        {...field}
                        autoFocus
                        InputProps={{
                          className: classes.textField,
                          classes: {
                            input: classes.input,
                            underline: classes.underline,
                          },
                        }}
                        error={!!errorMessage}
                        helperText={errorMessage}
                        id="name"
                        label={null}
                        margin="none"
                        name="name"
                        required
                        type="text"
                        variant="standard"
                      />
                    )
                  }}
                </Field>
                <Button
                  className={classes.saveButton}
                  disabled={isSubmitting || !isValid}
                  type="submit"
                >
                  <SaveIcon className={classes.saveIcon} />
                </Button>
              </form>
            )}
          </Formik>
        </Hotkeys>
      )
    }

    return (
      <div className={classes.root}>
        <Typography
          color="inherit"
          variant="h5"
          component="h1"
          onClick={this.beginEditing}
        >
          {album.name}
        </Typography>
        <Button className={classes.editButton} onClick={this.beginEditing}>
          <EditIcon />
        </Button>
      </div>
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(AlbumTitle)
