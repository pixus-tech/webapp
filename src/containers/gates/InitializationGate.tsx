import React from 'react'
import { PersistGate } from 'redux-persist/integration/react'

import FullScreenLoader from 'components/FullScreenLoader'
import storeConfiguration from 'store'

import ConnectivityGate from './ConnectivityGate'
import SettingsGate from './SettingsGate'

const InitializationGate: React.SFC = ({ children }) => (
  <ConnectivityGate>
    <SettingsGate>
      <PersistGate
        loading={<FullScreenLoader isLoading />}
        persistor={storeConfiguration.persistor}
      >
        {children}
      </PersistGate>
    </SettingsGate>
  </ConnectivityGate>
)

export default InitializationGate
