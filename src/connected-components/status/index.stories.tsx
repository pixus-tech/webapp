import React from 'react'

import { PureStatus } from './'

export default { title: 'Status' }

export const noPendingUploads = () => (
  <PureStatus
    currentUploadIds={[]}
    failedUploads={{}}
    succeededUploadIds={[]}
  />
)

export const pendingUploads = () => (
  <PureStatus
    currentUploadIds={['1', '2']}
    failedUploads={{}}
    succeededUploadIds={['1']}
  />
)

export const finishedUploads = () => (
  <PureStatus
    currentUploadIds={['1']}
    failedUploads={{}}
    succeededUploadIds={['1']}
  />
)
