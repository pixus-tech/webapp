import Album from 'models/album'

export enum ModalType {
  InviteUser = 'InviteUser',
}

interface DefaultModalProps {}

export interface InviteUserModalProps extends DefaultModalProps {
  album: Album
}

export type ModalProps = InviteUserModalProps

export interface ModalPropsMap {
  [ModalType.InviteUser]: InviteUserModalProps
}

export interface ModalData<T extends ModalType> {
  type: T
  props: ModalPropsMap[T]
}
