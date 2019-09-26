declare module 'radiks' {
  import { UserSession } from 'blockstack'
  import EventEmitter from 'wolfy87-eventemitter'
  // export { Model, configure, getConfig, UserGroup, GroupMembership, User, GroupInvitation, Central, };

  declare interface Attrs {
    createdAt?: number
    updatedAt?: number
    signingKeyId?: string
    _id?: string
    [key: string]: any
  }

  declare interface SchemaAttribute {
    type: string | Record<string, any> | any[] | number | boolean
    decrypted?: boolean
  }

  declare interface Schema {
    [key: string]:
      | SchemaAttribute
      | string
      | Record<string, any>
      | any[]
      | number
      | boolean
  }

  declare interface FindQuery {
    limit?: number
    [x: string]: any
  }

  declare interface FetchOptions {
    decrypt?: boolean
  }

  export declare class Model {
    static schema: Schema
    static defaults: any
    static className?: string
    static emitter?: EventEmitter
    schema: Schema
    _id: string
    attrs: Attrs
    static fromSchema(schema: Schema): typeof Model
    static fetchList<T extends Model>(
      _selector?: FindQuery,
      { decrypt }?: FetchOptions,
    ): Promise<T[]>
    static findOne<T extends Model>(
      _selector?: FindQuery,
      options?: FetchOptions,
    ): Promise<T>
    static findById<T extends Model>(
      _id: string,
      fetchOptions?: Record<string, any>,
    ): Promise<Model>
    static count(_selector?: FindQuery): Promise<number>
    static fetchOwnList<T extends Model>(_selector?: FindQuery): Promise<T[]>
    constructor(attrs?: Attrs)
    save(): Promise<unknown>
    encrypted(): Promise<{
      _id: string
      createdAt?: number
      updatedAt?: number
      signingKeyId?: string
    }>
    saveFile(encrypted: Record<string, any>): Promise<string>
    deleteFile(): Promise<void>
    blockstackPath(): string
    fetch({ decrypt }?: { decrypt?: boolean }): Promise<this | undefined>
    decrypt(): Promise<this>
    update(attrs: Attrs): void
    sign(): Promise<true | this>
    getSigningKey(): any
    encryptionPublicKey(): Promise<string>
    encryptionPrivateKey(): string
    static modelName(): string
    modelName(): string
    isOwnedByUser(): boolean
    static onStreamEvent: (_this: any, [event]: [any]) => void
    static addStreamListener(callback: () => void): void
    static removeStreamListener(callback: () => void): void
    destroy(): Promise<boolean>
    beforeSave(): void
    afterFetch(): void
  }

  declare interface UserGroupKeys {
    userGroups: {
      [userGroupId: string]: string
    }
    signingKeys: {
      [signingKeyId: string]: string
    }
  }
  export declare class GroupMembership extends Model {
    static className: string
    static schema: {
      userGroupId: StringConstructor
      username: {
        type: StringConstructor
        decrypted: boolean
      }
      signingKeyPrivateKey: StringConstructor
      signingKeyId: StringConstructor
    }
    static fetchUserGroups(): Promise<UserGroupKeys>
    static cacheKeys(): Promise<void>
    static clearStorage(): Promise<void>
    static userGroupKeys(): any
    encryptionPublicKey(): Promise<any>
    encryptionPrivateKey(): string
    getSigningKey(): {
      _id: string
      privateKey: string
    }
    fetchUserGroupSigningKey(): Promise<{
      _id: string
      signingKeyId: string
    }>
  }

  export declare class User extends Model {
    static className: string
    static schema: Schema
    static currentUser(): User
    createSigningKey(): Promise<SigningKey>
    static createWithCurrentUser(): Promise<User>
    sign(): Promise<this>
  }

  export declare class GroupInvitation extends Model {
    static className: string
    userPublicKey: string
    static schema: Schema
    static defaults: {
      updatable: boolean
    }
    static makeInvitation(
      username: string,
      userGroup: UserGroup,
    ): Promise<GroupInvitation>
    activate(): Promise<true | GroupMembership>
    encryptionPublicKey(): Promise<string>
    encryptionPrivateKey(): string
  }

  declare interface Member {
    username: string
    inviteId: string
  }

  export declare class UserGroup extends Model {
    privateKey?: string
    static schema: Schema
    static defaults: {
      members: Member[]
    }
    static find(id: string): Promise<UserGroup>
    create(): Promise<this>
    makeGroupMembership(username: string): Promise<GroupInvitation>
    static myGroups(): Promise<UserGroup[]>
    publicKey(): string
    encryptionPublicKey(): Promise<string>
    encryptionPrivateKey(): string | undefined
    static modelName: () => string
    getSigningKey(): {
      privateKey: any
      id: any
    }
  }

  export declare class SigningKey extends Model {
    static className: string
    static schema: {
      publicKey: {
        type: StringConstructor
        decrypted: boolean
      }
      privateKey: StringConstructor
      userGroupId: {
        type: StringConstructor
        decrypted: boolean
      }
    }
    static defaults: {
      updatable: boolean
    }
    static create(attrs?: {}): Promise<SigningKey>
    encryptionPrivateKey: () => string
  }

  declare interface Config {
    apiServer: string
    userSession: UserSession
  }

  export const configure: (newConfig: Config) => void
  export const getConfig: () => Config
}

declare module 'radiks/lib/models/signing-key'
declare module 'radiks/lib/helpers'

/*
declare module "config" {
}
declare module "types/index" {
    interface GaiaScope {
        scope: string;
        domain: string;
    }
    export interface UserSession {
        loadUserData: () => {
            appPrivateKey: string;
            profile: Record<string, any>;
            username: string;
            hubUrl: string;
        };
        putFile: (path: string, value: any, options: any) => string;
        connectToGaiaHub: (url: string, privateKey: string, scopes: GaiaScope[]) => any;
    }
}
declare module "helpers" {
    import Model from "model";
    export const GROUP_MEMBERSHIPS_STORAGE_KEY = "GROUP_MEMBERSHIPS_STORAGE_KEY";
    export const decryptObject: (encrypted: any, model: Model) => Promise<any>;
    export const encryptObject: (model: Model) => Promise<{
        _id: string;
        createdAt?: number;
        updatedAt?: number;
        signingKeyId?: string;
    }>;
    export const clearStorage: () => void;
    export const userGroupKeys: () => any;
    export const addPersonalSigningKey: (signingKey: any) => void;
    export const addUserGroupKey: (userGroup: any) => void;
    export const requireUserSession: () => import("blockstack").UserSession;
    export const loadUserData: () => import("blockstack/lib/auth/authApp").UserData;
}
declare module "streamer" {
    export default class Streamer {
        static initialized: boolean;
        static socket: WebSocket;
        static emitter: EventEmitter;
        static init(): WebSocket;
        static addListener(callback: (args: any[]) => void): void;
        static removeListener(callback: Function): void;
    }
}
declare module "api" {
    import Model from "model";
    export const sendNewGaiaUrl: (gaiaURL: string) => Promise<boolean>;
    export const find: (query: FindQuery) => Promise<any>;
    export const count: (query: FindQuery) => Promise<any>;
    interface CentralSaveData {
        signature: string;
        username: string;
        key: string;
        value: any;
    }
    export const saveCentral: (data: CentralSaveData) => Promise<any>;
    export const fetchCentral: (key: string, username: string, signature: string) => Promise<any>;
    export const destroyModel: (model: Model) => Promise<any>;
}
declare module "central" {
    class Central {
        static save(key: string, value: Record<string, any>): Promise<any>;
        static get(key: string): Promise<any>;
        static makeSignature(key: string): {
            username: string;
            signature: string;
        };
    }
    export default Central;
}
  */
