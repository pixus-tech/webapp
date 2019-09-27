import _ from 'lodash'
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import UserListItem from 'components/UserListItem'
import User from 'models/user'

import SendIcon from '@material-ui/icons/Send'

export interface IProps {
  className?: string
  onSubmit: (message: string) => void
  onChangeUsername: (username: string) => void
  isFetchingUser: boolean
  user?: User | null
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    idTextField: {},
    messageTextField: {
      marginTop: theme.spacing(1),
    },
    notFoundMessage: {
      margin: theme.spacing(2),
      textAlign: 'center',
    },
    submitContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      margin: theme.spacing(1, 0),
    },
    userItem: {
      marginTop: theme.spacing(2),
    },
    sendIcon: {
      marginLeft: theme.spacing(1),
    },
  }),
)

function InviteUserForm({
  className,
  isFetchingUser,
  onChangeUsername,
  onSubmit,
  user,
}: IProps) {
  const [message, setMessage] = React.useState('')
  const classes = useStyles()

  const userIdEndAdornment = !isFetchingUser ? null : (
    <InputAdornment position="end">
      <CircularProgress size={18} />
    </InputAdornment>
  )

  const debouncedOnChangeUsername = _.debounce(onChangeUsername, 1000)

  return (
    <div className={className}>
      {!user && (
        <TextField
          InputProps={{
            endAdornment: userIdEndAdornment,
          }}
          autoFocus
          className={classes.idTextField}
          fullWidth
          label={null}
          name="addressee"
          onChange={event =>
            debouncedOnChangeUsername(event.currentTarget.value)
          }
          placeholder="Find a user by their Blockstack ID"
          required
        />
      )}
      {user === null && (
        <>
          <Typography
            className={classes.notFoundMessage}
            color="inherit"
            variant="body1"
            component="p"
          >
            User could not be found.
          </Typography>
        </>
      )}
      {user && (
        <>
          <UserListItem className={classes.userItem} user={user} />
          <TextField
            autoFocus
            className={classes.messageTextField}
            placeholder={`Hi${user.name &&
              ' ' +
                user.name}, I'd like to invite you to collaborate on this album.`}
            fullWidth
            label="Add an optional message"
            multiline
            name="message"
            onChange={event => setMessage(event.currentTarget.value)}
            type="text"
            value={message}
            variant="outlined"
          />
          <div className={classes.submitContainer}>
            <Button
              color="primary"
              onClick={() => onSubmit(message)}
              type="submit"
              variant="contained"
            >
              Send Invite
              <SendIcon className={classes.sendIcon} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default InviteUserForm
