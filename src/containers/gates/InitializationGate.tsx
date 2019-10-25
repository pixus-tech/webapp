import React from 'react'
import { PersistGate } from 'redux-persist/integration/react'

import FullScreenLoader from 'components/FullScreenLoader'
import storeConfiguration from 'store'

import SettingsGate from './SettingsGate'

const InitializationGate: React.SFC = ({ children }) => (
  <SettingsGate>
    <PersistGate
      loading={<FullScreenLoader isLoading />}
      persistor={storeConfiguration.persistor}
    >
      {children}
    </PersistGate>
  </SettingsGate>
)

export default InitializationGate
