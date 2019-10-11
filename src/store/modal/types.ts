import Album from 'models/album'
import Image from 'models/image'

export enum ModalType {
  InviteUser = 'InviteUser',
  ConfirmImageDeletion = 'ConfirmImageDeletion',
}

interface DefaultModalProps {}

export interface InviteUserModalProps extends DefaultModalProps {
  album: Album
}

export interface ConfirmImageDeletionModalProps extends DefaultModalProps {
  image: Image
}

export type ModalProps = InviteUserModalProps | ConfirmImageDeletionModalProps

export interface ModalPropsMap {
  [ModalType.InviteUser]: InviteUserModalProps
  [ModalType.ConfirmImageDeletion]: ConfirmImageDeletionModalProps
}

export interface ModalData<T extends ModalType> {
  type: T
  props: ModalPropsMap[T]
}
