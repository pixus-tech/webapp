import React from 'react'

import { PureStatus } from './'

export default { title: 'Status' }

export const noPendingUploads = () => (
  <PureStatus
    currentUploadIds={[]}
    dirtyDBRecordCount={0}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploadIds={[]}
  />
)

export const pendingUploads = () => (
  <PureStatus
    currentUploadIds={['1', '2']}
    dirtyDBRecordCount={0}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploadIds={['1']}
  />
)

export const finishedUploads = () => (
  <PureStatus
    currentUploadIds={['1']}
    dirtyDBRecordCount={0}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploadIds={['1']}
  />
)

export const dbIsDirty = () => (
  <PureStatus
    currentUploadIds={[]}
    dirtyDBRecordCount={3}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={false}
    succeededUploadIds={[]}
  />
)

export const dbIsSaving = () => (
  <PureStatus
    currentUploadIds={[]}
    dirtyDBRecordCount={3}
    dispatchSaveDatabase={console.log}
    failedUploads={{}}
    isSavingDB={true}
    succeededUploadIds={[]}
  />
)
