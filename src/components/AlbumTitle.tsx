import React from 'react'
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

import Album, { validationSchema } from 'models/album'

const styles = (theme: Theme) =>
  createStyles({
    form: {
      display: 'flex',
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    textField: {
      ...theme.typography.h5,
      color: 'inherit',
    },
    saveIcon: {
      marginLeft: theme.spacing(1),
    },
    submit: {
      marginLeft: theme.spacing(1),
    },
  })

interface IProps {
  album: Album
  onSave: (album: Album) => void
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

  save = (name: string) => {
    this.props.onSave({
      ...this.props.album,
      name,
    })
    this.endEditing()
  }

  render() {
    const { album, classes } = this.props
    const { isEditing } = this.state

    if (isEditing) {
      return (
        <Formik
          initialValues={{ name: album.name }}
          validationSchema={validationSchema}
          onSubmit={({ name }, actions) => {
            if (name !== undefined) {
              this.save(name)
            }
            actions.setSubmitting(false)
          }}
        >
          {({
            handleSubmit,
            isSubmitting,
            isValid,
          }: FormikProps<Partial<Album>>) => (
            <form className={classes.form} onSubmit={handleSubmit}>
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
                className={classes.submit}
                color="secondary"
                disabled={isSubmitting || !isValid}
                type="submit"
                variant="contained"
              >
                Save
                <SaveIcon className={classes.saveIcon} />
              </Button>
            </form>
          )}
        </Formik>
      )
    }

    return (
      <Typography
        color="inherit"
        variant="h5"
        component="h1"
        onClick={this.beginEditing}
      >
        {album.name}
      </Typography>
    )
  }
}

export default compose<ComposedProps, IProps>(withStyles(styles))(AlbumTitle)
