/* eslint-disable */

declare module "radiks" {
  import { UserSession } from "blockstack";
  type EventEmitter = any;

  declare interface Attrs {
    createdAt?: number;
    updatedAt?: number;
    signingKeyId?: string;
    _id?: string;
    [key: string]: any;
  }

  declare interface SchemaAttribute {
    type: string | Record<string, any> | any[] | number | boolean;
    decrypted?: boolean;
  }

  declare interface Schema {
    [key: string]:
      | SchemaAttribute
      | string
      | Record<string, any>
      | any[]
      | number
      | boolean;
  }

  declare interface FindQuery {
    limit?: number;
    [x: string]: any;
  }

  declare interface FetchOptions {
    decrypt?: boolean;
  }

  export declare class Model {
    static schema: Schema;
    static defaults: any;
    static className?: string;
    static emitter?: EventEmitter;
    schema: Schema;
    _id: string;
    attrs: Attrs;
    static fromSchema(schema: Schema): typeof Model;
    static fetchList<T extends Model>(
      _selector?: FindQuery,
      { decrypt }?: FetchOptions
    ): Promise<T[]>;
    static findOne<T extends Model>(
      _selector?: FindQuery,
      options?: FetchOptions
    ): Promise<T>;
    static findById<T extends Model>(
      _id: string,
      fetchOptions?: Record<string, any>
    ): Promise<Model>;
    static count(_selector?: FindQuery): Promise<number>;
    static fetchOwnList<T extends Model>(_selector?: FindQuery): Promise<T[]>;
    constructor(attrs?: Attrs);
    save<T extends Model>(): Promise<T>;
    encrypted(): Promise<{
      _id: string;
      createdAt?: number;
      updatedAt?: number;
      signingKeyId?: string;
    }>;
    saveFile(encrypted: Record<string, any>): Promise<string>;
    deleteFile(): Promise<void>;
    blockstackPath(): string;
    fetch({ decrypt }?: { decrypt?: boolean }): Promise<this | undefined>;
    decrypt(): Promise<this>;
    update(attrs: Attrs): void;
    sign(): Promise<true | this>;
    getSigningKey(): any;
    encryptionPublicKey(): Promise<string>;
    encryptionPrivateKey(): string;
    static modelName(): string;
    modelName(): string;
    isOwnedByUser(): boolean;
    static onStreamEvent: (_this: any, [event]: [any]) => void;
    static addStreamListener(callback: () => void): void;
    static removeStreamListener(callback: () => void): void;
    destroy(): Promise<boolean>;
    beforeSave(): void;
    afterFetch(): void;
  }

  declare interface UserGroupKeys {
    userGroups: {
      [userGroupId: string]: string;
    };
    signingKeys: {
      [signingKeyId: string]: string;
    };
  }
  export declare class GroupMembership extends Model {
    static className: string;
    static schema: {
      userGroupId: StringConstructor;
      username: {
        type: StringConstructor;
        decrypted: boolean;
      };
      signingKeyPrivateKey: StringConstructor;
      signingKeyId: StringConstructor;
    };
    static fetchUserGroups(): Promise<UserGroupKeys>;
    static cacheKeys(): Promise<void>;
    static clearStorage(): Promise<void>;
    static userGroupKeys(): any;
    encryptionPublicKey(): Promise<any>;
    encryptionPrivateKey(): string;
    getSigningKey(): {
      _id: string;
      privateKey: string;
    };
    fetchUserGroupSigningKey(): Promise<{
      _id: string;
      signingKeyId: string;
    }>;
  }

  export declare class User extends Model {
    static className: string;
    static schema: Schema;
    static currentUser(): User;
    createSigningKey(): Promise<SigningKey>;
    static createWithCurrentUser(): Promise<User>;
    sign(): Promise<this>;
  }

  export declare class GroupInvitation extends Model {
    static className: string;
    userPublicKey: string;
    static schema: Schema;
    static defaults: {
      updatable: boolean;
    };
    static makeInvitation(
      username: string,
      userGroup: UserGroup
    ): Promise<GroupInvitation>;
    activate(): Promise<true | GroupMembership>;
    encryptionPublicKey(): Promise<string>;
    encryptionPrivateKey(): string;
  }

  declare interface Member {
    username: string;
    inviteId: string;
  }

  export declare class UserGroup extends Model {
    privateKey?: string;
    static schema: Schema;
    static defaults: {
      members: Member[];
    };
    static find(id: string): Promise<UserGroup>;
    create(): Promise<this>;
    makeGroupMembership(username: string): Promise<GroupInvitation>;
    static myGroups(): Promise<UserGroup[]>;
    publicKey(): string;
    encryptionPublicKey(): Promise<string>;
    encryptionPrivateKey(): string;
    static modelName: () => string;
    getSigningKey(): {
      privateKey: any;
      id: any;
    };
  }

  export declare class SigningKey extends Model {
    static className: string;
    static schema: {
      publicKey: {
        type: StringConstructor;
        decrypted: boolean;
      };
      privateKey: StringConstructor;
      userGroupId: {
        type: StringConstructor;
        decrypted: boolean;
      };
    };
    static defaults: {
      updatable: boolean;
    };
    static create(attrs?: {}): Promise<SigningKey>;
    encryptionPrivateKey: () => string;
  }

  declare interface Config {
    apiServer: string;
    userSession: UserSession;
  }

  export const configure: (newConfig: Config) => void;
  export const getConfig: () => Config;
}

declare module "radiks/lib/models/signing-key";
declare module "radiks/lib/helpers";
