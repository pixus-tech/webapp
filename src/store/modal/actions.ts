import { createStandardAction } from 'typesafe-actions'

import { ModalData, ModalType } from './types'

export const showModal = createStandardAction('MODAL__SHOW')<
  ModalData<ModalType>
>()

export const hideModal = createStandardAction('MODAL__HIDE')<undefined>()
