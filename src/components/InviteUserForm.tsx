import cx from 'classnames'
import _ from 'lodash'
import React from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'

import Autocomplete, {
  OptionType,
  OptionValue,
} from 'components/inputs/Autocomplete'
import UserListItem from 'components/UserListItem'
import User, { userLabel } from 'models/user'

import SendIcon from '@material-ui/icons/Send'

export interface IProps {
  className?: string
  isFetchingSuggestions: boolean
  onChangeSelectedUsers: (usernames: string[]) => void
  onChangeUsername: (username: string) => void
  onSubmit: (message: string) => void
  selectedUsers: User[]
  suggestedUsers: User[]
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      minWidth: '300',
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
      padding: 0,
    },
    sendIcon: {
      marginLeft: theme.spacing(1),
    },
  }),
)

function InviteUserForm({
  className,
  isFetchingSuggestions,
  onChangeSelectedUsers,
  onChangeUsername,
  onSubmit,
  selectedUsers,
  suggestedUsers,
}: IProps) {
  const [message, setMessage] = React.useState('')
  const classes = useStyles()

  const userIdEndAdornment = !isFetchingSuggestions ? null : (
    <InputAdornment position="end">
      <CircularProgress size={18} />
    </InputAdornment>
  )

  function onSelect(options: OptionValue) {
    if (options !== undefined && options !== null) {
      const usernames = _.map(options as OptionType[], option => option.value)
      onChangeSelectedUsers(usernames)
    } else {
      onChangeSelectedUsers([])
    }
  }

  const suggestions = _.map(suggestedUsers, user => ({
    label: userLabel(user),
    value: user.username,
  }))

  const value = _.map(selectedUsers, user => ({
    label: userLabel(user),
    value: user.username,
  }))

  return (
    <div className={cx(classes.container, className)}>
      <Autocomplete
        TextFieldProps={{
          InputProps: {
            endAdornment: userIdEndAdornment,
          },
          autoFocus: true,
          fullWidth: true,
          onChange: event => onChangeUsername(event.target.value),
        }}
        isMulti
        label="Users"
        placeholder="Find users by their Blockstack ID"
        select={onSelect}
        suggestions={suggestions}
        value={value}
      />
      {selectedUsers.length > 0 && (
        <>
          {_.map(selectedUsers, user => (
            <UserListItem
              className={classes.userItem}
              key={user.username}
              user={user}
              component="div"
            />
          ))}
          <TextField
            autoFocus
            className={classes.messageTextField}
            placeholder={`Hi, I'd like to invite you to collaborate on this album.`}
            fullWidth
            label="Add an optional message"
            multiline
            name="message"
            onChange={event => setMessage(event.currentTarget.value)}
            type="text"
            value={message}
          />
          <div className={classes.submitContainer}>
            <Button
              color="secondary"
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
