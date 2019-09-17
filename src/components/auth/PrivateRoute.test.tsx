import { mount } from 'enzyme'
import React from 'react'
import { MemoryRouter, Route } from 'react-router'

import PrivateRoute from './PrivateRoute'

const PrivateComponent: React.FC = () => <>Authenticated</>

const Login: React.FC = () => <>Login</>

describe('PrivateRoute', () => {
  it('renders child if user is authenticated', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/secret']}>
        <PrivateRoute
          component={PrivateComponent}
          exact
          isAuthenticated={true}
          loginPath="/login"
          path="/secret"
        />
        <Route exact path="/login" component={Login} />
      </MemoryRouter>,
    )
    expect(wrapper.find(PrivateComponent)).toHaveLength(1)
    expect(wrapper.find(Login)).toHaveLength(0)
  })

  it('redirects to login if user is not authenticated', () => {
    const wrapper = mount(
      <MemoryRouter initialEntries={['/secret']}>
        <PrivateRoute
          component={PrivateComponent}
          exact
          isAuthenticated={false}
          loginPath="/login"
          path="/secret"
        />
        <Route exact path="/login" component={Login} />
      </MemoryRouter>,
    )
    expect(wrapper.find(PrivateComponent)).toHaveLength(0)
    expect(wrapper.find(Login)).toHaveLength(1)
  })
})
