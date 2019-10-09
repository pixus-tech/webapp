import React from 'react'
import SettingsFailure from './SettingsFailure'

export default { title: 'Settings Failure Message' }

export const loadedSuccessfully = () => (
  <SettingsFailure onRetry={console.log} />
)

export const hubUnreachable = () => <SettingsFailure onRetry={console.log} />

export const radiksUnreachable = () => <SettingsFailure onRetry={console.log} />

export const loadingDidFail = () => <SettingsFailure onRetry={console.log} />
