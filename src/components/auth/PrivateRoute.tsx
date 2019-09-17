import React from 'react'
import { Redirect, Route, RouteProps } from 'react-router-dom'

import { isFunction } from 'lodash'

interface IProps extends RouteProps {
  isAuthenticated: boolean
  loginPath: string
}

const PrivateRoute: React.FC<IProps> = ({
  component,
  isAuthenticated,
  loginPath,
  render,
  ...rest
}) => {
  const Component = component as React.ComponentClass<any> | React.FC<any>
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          isFunction(render) ? (
            render(props)
          ) : (
            <Component {...props} />
          )
        ) : (
          <Redirect
            to={{
              pathname: loginPath,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

export default PrivateRoute
