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

import { Formik, FormikProps, Field, FieldProps } from 'formik'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import Divider from '@material-ui/core/Divider'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import InputAdornment from '@material-ui/core/InputAdornment'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import SettingsSchema, { validationSchema } from 'models/settings'
import { resetDatabase } from 'store/database/actions'
import { saveSettings } from 'store/settings/actions'

const styles = (theme: Theme) =>
  createStyles({
    container: {
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2, 0),
      },
      padding: theme.spacing(2),
      textAlign: 'justify',
    },
    divider: {
      backgroundColor: theme.palette.grey[300],
      margin: theme.spacing(3, 0),
    },
    headline: {},
    h2: {
      marginTop: theme.spacing(3),
    },
    h3: {
      marginTop: theme.spacing(1),
    },
    progress: {
      marginLeft: theme.spacing(1),
    },
    submit: {
      marginTop: theme.spacing(3),
    },
    dangerButton: {
      marginTop: theme.spacing(3),
      color: theme.palette.error.contrastText,
      backgroundColor: theme.palette.error.main,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
    textField: {
      minWidth: 290,
    },
    paper: {
      [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
      },
      backgroundColor: theme.palette.common.white,
      color: theme.palette.primary.main,
      padding: theme.spacing(4),
    },
  })

interface IDispatchProps {
  dispatchResetDatabase: () => void
  dispatchSaveSettings: (settings: SettingsSchema) => void
}

interface IStateProps {
  settings: SettingsSchema
  isLoading: boolean
  isResettingDatabase: boolean
}

type ComposedProps = IDispatchProps & IStateProps & WithStyles<typeof styles>

const Settings: React.FC<ComposedProps> = ({
  classes,
  dispatchResetDatabase,
  dispatchSaveSettings,
  isLoading,
  isResettingDatabase,
  settings,
}) => {
  return (
    <div className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <Typography className={classes.headline} component="h1" variant="h4">
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
          {({ handleSubmit, isValid }: FormikProps<SettingsSchema>) => (
            <form onSubmit={handleSubmit}>
              <Grid container alignItems="flex-start" spacing={1}>
                <Grid item lg={8}>
                  <Grid item xs={12}>
                    <Typography
                      component="h2"
                      variant="h5"
                      className={classes.h2}
                    >
                      Analytics
                    </Typography>
                    <Typography component="p" variant="body1">
                      Pixus uses an unintrusive analytics tool that does not
                      track you. It does not even set cookies. The resulting
                      aggregate data is without any PII and helps to get a high
                      level understanding of how pixus is being used.
                    </Typography>
                    <Field name="optOutAnalytics">
                      {({ field }: FieldProps) => (
                        <FormControlLabel
                          control={
                            <Checkbox {...field} checked={field.value} />
                          }
                          label="Disable anonymous analytics"
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      component="h2"
                      variant="h5"
                      className={classes.h2}
                    >
                      File chunking
                    </Typography>
                    <Typography component="p" variant="body1">
                      Some Gaia Hubs restrict the maximum uploadable file-size.
                      The default Gaia Hub of Blockstack PBC does e.g. cap at
                      5MB per file. Through pixus, you can still upload larger
                      files by chunking them.
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
                    <Typography
                      component="h2"
                      variant="h5"
                      className={classes.h2}
                    >
                      Concurrency
                    </Typography>
                    <Typography component="p" variant="body1">
                      Some time- or resource-intensive operations can be
                      processed in parallel to deliver the best possible
                      experience when using pixus. You can configure the degree
                      of concurrency below to best suit your use-case.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      component="h3"
                      variant="h6"
                      className={classes.h3}
                    >
                      Uploading
                    </Typography>
                    <Typography component="p" variant="body1">
                      If one upload at a time is not fully utilizing your
                      possible upstream, then increasing the upload concurrency
                      can help.
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
                    <Typography
                      component="h3"
                      variant="h6"
                      className={classes.h3}
                    >
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
                    <Typography
                      component="h3"
                      variant="h6"
                      className={classes.h3}
                    >
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
                    <Typography
                      component="h3"
                      variant="h6"
                      className={classes.h3}
                    >
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
            </form>
          )}
        </Formik>

        <Divider className={classes.divider} />

        <Grid container alignItems="flex-start" spacing={1}>
          <Grid item lg={8}>
            <Grid item xs={12}>
              <Typography
                className={classes.headline}
                component="h2"
                variant="h5"
              >
                Danger Zone
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography component="h3" variant="h6" className={classes.h3}>
                Reset browser cache
              </Typography>

              <Typography component="p" variant="body1">
                Pixus uses a browser internal database for caching the meta data
                that is stored in your Gaia storage. You can reset that local
                cache and restore it from what is stored remotely.
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                className={classes.dangerButton}
                onClick={dispatchResetDatabase}
              >
                Reset browser cache
                {isResettingDatabase && (
                  <CircularProgress size={16} className={classes.progress} />
                )}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  )
}

function mapStateToProps(store: RootState): IStateProps {
  return {
    isLoading: store.settings.isLoading,
    isResettingDatabase: store.database.isResetting,
    settings: store.settings.data,
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootAction>): IDispatchProps {
  return {
    dispatchResetDatabase: () => {
      dispatch(resetDatabase.request())
    },
    dispatchSaveSettings: settings => {
      dispatch(saveSettings.request(settings))
    },
  }
}

export default compose<ComposedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withStyles(styles),
)(Settings)
