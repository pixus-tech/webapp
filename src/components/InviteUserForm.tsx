import cx from 'classnames'
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Formik, FormikProps, Form, Field, FieldProps } from 'formik'
import Notification, { validationSchema } from 'models/notification'

import SendIcon from '@material-ui/icons/Send'

export interface IProps {
  className?: string
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    textField: {},
    submit: {},
    sendIcon: {
      marginLeft: theme.spacing(1),
    },
  }),
)

function save() {
  console.log('saving user form')
}

function InviteUserForm({ className }: IProps) {
  const classes = useStyles()

  return (
    <Formik
      validationSchema={validationSchema.invite}
      onSubmit={({ addressee, message }, actions) => {
        save()
        actions.setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid }: FormikProps<Partial<Notification>>) => (
        <Form className={cx(className, classes.container)}>
          <Field name="addressee">
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
                  label={null}
                  margin="none"
                  name="addressee"
                  required
                  type="text"
                  variant="standard"
                />
              )
            }}
          </Field>
          <Field name="message">
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
                  label={null}
                  margin="none"
                  name="message"
                  multiline
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
            Invite
            <SendIcon className={classes.sendIcon} />
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default InviteUserForm
