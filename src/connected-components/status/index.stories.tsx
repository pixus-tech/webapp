import React from 'react'

import { PureStatus } from './'

export default { title: 'Status' }

export const noPendingUploads = () => (
  <PureStatus
    currentUploads={{}}
    dirtyDBRecordCount={0}
    dispatchResumePendingUploads={console.log}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploads={{}}
  />
)

export const pendingUploads = () => (
  <PureStatus
    currentUploads={{ 1: true, 2: true }}
    dirtyDBRecordCount={0}
    dispatchResumePendingUploads={console.log}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploads={{ 1: true }}
  />
)

export const finishedUploads = () => (
  <PureStatus
    currentUploads={{ 1: true }}
    dirtyDBRecordCount={0}
    dispatchResumePendingUploads={console.log}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploads={{ 1: true }}
  />
)

export const dbIsDirty = () => (
  <PureStatus
    currentUploads={{}}
    dirtyDBRecordCount={3}
    dispatchResumePendingUploads={console.log}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploads={{}}
  />
)

export const dbIsSaving = () => (
  <PureStatus
    currentUploads={{}}
    dirtyDBRecordCount={3}
    dispatchResumePendingUploads={console.log}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={true}
    succeededUploads={{}}
  />
)
