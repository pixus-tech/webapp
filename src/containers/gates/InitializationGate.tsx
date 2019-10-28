import React from 'react'
import { PersistGate } from 'redux-persist/integration/react'

import FullScreenLoader from 'components/FullScreenLoader'
import storeConfiguration from 'store'

import ResumeGate from './ResumeGate'
import SettingsGate from './SettingsGate'

const InitializationGate: React.SFC = ({ children }) => (
  <PersistGate
    loading={<FullScreenLoader isLoading />}
    persistor={storeConfiguration.persistor}
  >
    <SettingsGate>
      <ResumeGate>{children}</ResumeGate>
    </SettingsGate>
  </PersistGate>
)

export default InitializationGate
