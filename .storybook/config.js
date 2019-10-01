import React from 'react'
import { configure, storiesOf, addDecorator } from '@storybook/react'

import CenterDecorator from './decorators/center.js'
import ThemeDecorator from './decorators/theme.js'

addDecorator(CenterDecorator)
addDecorator(ThemeDecorator)

configure(require.context('../src', true, /\.stories\.tsx$/), module)
