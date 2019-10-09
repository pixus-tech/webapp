import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Dispatch } from 'redux'
import { RootAction, RootState } from 'typesafe-actions'

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'

import { Formik, FormikProps, Form, Field, FieldProps } from 'formik'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'

import SettingsSchema, { validationSchema } from 'models/settings'
import { saveSettings } from 'store/settings/actions'

const styles = (theme: Theme) =>
  createStyles({
    container: {
      padding: theme.spacing(2),
    },
    headline: {},
    progress: {
      marginLeft: theme.spacing(1),
    },
    submit: {},
    textField: {},
  })

interface IDispatchProps {
  dispatchSaveSettings: typeof saveSettings.request
}

interface IStateProps {
  settings: SettingsSchema
  isLoading: boolean
}

type ComposedProps = IDispatchProps & IStateProps & WithStyles<typeof styles>

const Settings: React.FC<ComposedProps> = ({
  classes,
  dispatchSaveSettings,
  isLoading,
  settings,
}) => {
  return (
    <div className={classes.container}>
      <Typography className={classes.headline} component="h2" variant="h4">
        Settings
      </Typography>

      <Formik
        initialValues={settings}
        validationSchema={validationSchema}
        onSubmit={(nextSettings, actions) => {
          dispatchSaveSettings(nextSettings)
          actions.setSubmitting(false)
        }}
      >
        {({ isValid }: FormikProps<SettingsSchema>) => (
          <Form>
            <Grid container alignItems="flex-start" spacing={1}>
              <Grid item xs={6}>
                <Grid item xs={12}>
                  <Typography component="h3" variant="h5">
                    Analytics
                  </Typography>
                  <Typography component="p" variant="body1">
                    Pixus uses unintrusive analytics tool called simple
                    analytics. It does not track you and only allows us to keep
                    a high level overview of how much pixus is being used.
                  </Typography>
                  <Field name="optOutAnalytics">
                    {({ field }: FieldProps) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="Disable analytics"
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="h3" variant="h5">
                    File chunking
                  </Typography>
                  <Typography component="p" variant="body1">
                    Some Gaia Hubs restrict the maximum uploadable file-size.
                    The default Gaia Hub of Blockstack PBC does e.g. cap at 5MB
                    per file. Through pixus, you can still upload larger files
                    by chunking them.
                  </Typography>
                  <Field name="bytesPerFileChunk">
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
                            endAdornment: (
                              <InputAdornment position="end">
                                ≅&nbsp;{Math.round(field.value / 1000000)}MB
                              </InputAdornment>
                            ),
                          }}
                          error={!!errorMessage}
                          helperText={errorMessage}
                          variant="outlined"
                          margin="dense"
                          label="Max. Bytes per File-Chunk"
                          type="number"
                        />
                      )
                    }}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="h3" variant="h5">
                    Concurrency
                  </Typography>
                  <Typography component="p" variant="body1">
                    Some time- or resource-intensive operations can be processed
                    in parallel to deliver the best possible experience when
                    using pixus. You can configure the degree of concurrency
                    below to best suit your use-case.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="h4" variant="h6">
                    Uploading
                  </Typography>
                  <Typography component="p" variant="body1">
                    If one upload at a time is not fully utilizing your possible
                    upstream, then increasing the upload concurrency can help.
                  </Typography>
                  <Field name="uploadConcurrency">
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
                          variant="outlined"
                          margin="dense"
                          label="Max. concurrent uploads"
                          type="number"
                        />
                      )
                    }}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="h4" variant="h6">
                    Downloading
                  </Typography>
                  <Typography component="p" variant="body1">
                    If one download at a time is not fully utilizing your
                    possible downstream, then increasing the download
                    concurrency can help.
                  </Typography>
                  <Field name="downloadConcurrency">
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
                          variant="outlined"
                          margin="dense"
                          label="Max. concurrent downloads"
                          type="number"
                        />
                      )
                    }}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="h4" variant="h6">
                    En- and Decryption
                  </Typography>
                  <Typography component="p" variant="body1">
                    Encryption is a computationally intensive operation.
                    Depending on you machine, multiple en- or decryptions at a
                    time can better utilize your hardware.
                  </Typography>
                  <Field name="cryptoConcurrency">
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
                          variant="outlined"
                          margin="dense"
                          label="Max. concurrent en- or decryptions"
                          type="number"
                        />
                      )
                    }}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Typography component="h4" variant="h6">
                    File Operations
                  </Typography>
                  <Typography component="p" variant="body1">
                    When uploading files, pixus reads them into memory for
                    processing and eventually uploading them. Increasing file
                    operation concurrency can improve performance if you have
                    hardware that allows for parallel file io.
                  </Typography>
                  <Field name="fileConcurrency">
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
                          variant="outlined"
                          margin="dense"
                          label="Max. concurrent file operations"
                          type="number"
                        />
                      )
                    }}
                  </Field>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                    disabled={isLoading || !isValid}
                    type="submit"
                  >
                    Save
                    {isLoading && (
                      <CircularProgress
                        size={16}
                        className={classes.progress}
                      />
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  )
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isLoading: store.settings.isLoading,
    settings: store.settings.data,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchSaveSettings: (settings: SettingsSchema) =>
      dispatch(saveSettings.request(settings)),
  }
}

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(Settings)
