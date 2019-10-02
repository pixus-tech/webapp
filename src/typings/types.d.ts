import { ActionType } from 'typesafe-actions'

import rootService from 'services'
import rootAction from 'store/rootAction'
import rootReducer from 'store/rootReducer'

declare module 'typesafe-actions' {
  export type RootAction = ActionType<typeof rootAction>
  export type RootState = ReturnType<typeof rootReducer>
  export type RootService = typeof rootService

  interface Types {
    RootAction: RootAction
    RootService: RootService
    RootState: RootState
  }
}

export namespace API {
  interface NoFilter {}

  interface ResourceFilter {
    perPage: number
    page: number
  }

  interface NumericFilter {
    number: string
  }

  interface TimeFilter extends ResourceFilter {
    from: string
    to: string
  }

  interface ListResponse<T> {
    data: T[]
    filter: API.ResourceFilter
    meta: {
      total: number
    }
  }

  type ShowResponse<T> = T

  interface PutResponse<T> {
    resource: T
  }

  interface ErrorResponse<T> {
    error: Error
    resource: T
    showToast?: boolean
  }
}
