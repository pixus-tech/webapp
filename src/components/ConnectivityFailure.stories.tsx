import React from 'react'
import ConnectivityFailure from './ConnectivityFailure'

export default { title: 'Connectivity Failure Message' }

export const blockstackUnreachable = () => (
  <ConnectivityFailure
    isBlockstackReachable={false}
    isHubReachable={true}
    isRadiksReachable={true}
    onRetry={console.log}
  />
)

export const hubUnreachable = () => (
  <ConnectivityFailure
    isBlockstackReachable={true}
    isHubReachable={false}
    isRadiksReachable={true}
    onRetry={console.log}
  />
)

export const radiksUnreachable = () => (
  <ConnectivityFailure
    isBlockstackReachable={true}
    isHubReachable={true}
    isRadiksReachable={false}
    onRetry={console.log}
  />
)

export const allUnreachable = () => (
  <ConnectivityFailure
    isBlockstackReachable={false}
    isHubReachable={false}
    isRadiksReachable={false}
    onRetry={console.log}
  />
)
