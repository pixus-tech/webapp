import React from 'react'
import { Provider } from 'react-redux'

import storeConfiguration from '../../src/store/index'

const StoreDecorator = (story) => (
  <Provider store={storeConfiguration.store}>
    {story()}
  </Provider>
)

export default StoreDecorator
