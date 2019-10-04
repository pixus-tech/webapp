import React from 'react'
import Autocomplete, { OptionType } from './Autocomplete'
import { ValueType } from 'react-select/src/types'

export default { title: 'Autocomplete' }

export const noOptions = () => (
  <Autocomplete
    label="Users"
    placeholder="Find and select users to share the album with"
    select={console.log}
    suggestions={[]}
  />
)

export const multiSelectWithPreselection = () => (
  <Autocomplete
    isMulti
    label="Users"
    placeholder="Find and select users to share the album with"
    select={console.log}
    suggestions={[]}
    value={[{ label: 'xyz', value: 'test1.id.blockstack' }]}
  />
)

export const singleSelectWithPreselection = () => (
  <Autocomplete
    label="Users"
    placeholder="Find and select users to share the album with"
    select={console.log}
    suggestions={[]}
    value={[{ label: 'xyz', value: 'test1.id.blockstack' }]}
  />
)

export const multiWithSuggestions = () => {
  const [value, setValue] = React.useState<ValueType<OptionType>>(null)

  return (
    <Autocomplete
      isMulti
      label="Users"
      placeholder="Find and select users to share the album with"
      select={setValue}
      suggestions={[
        {
          value: 'test1.id.blockstack',
          label: 'Jon Doe',
        },
        {
          value: 'test2.id.blockstack',
          label: 'test2.id.blockstack',
        },
        {
          value: 'test3.id.blockstack',
          label: 'test3.id.blockstack',
        },
      ]}
      value={value}
    />
  )
}

export const singleWithSuggestions = () => {
  const [value, setValue] = React.useState<ValueType<OptionType>>(null)

  return (
    <Autocomplete
      label="Users"
      placeholder="Find and select users to share the album with"
      select={setValue}
      suggestions={[
        {
          value: 'test1.id.blockstack',
          label: 'Jon Doe',
        },
        {
          value: 'test2.id.blockstack',
          label: 'test2.id.blockstack',
        },
        {
          value: 'test3.id.blockstack',
          label: 'test3.id.blockstack',
        },
      ]}
      value={value}
    />
  )
}
