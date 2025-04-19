// Type declarations for @dfinity packages

declare module '@dfinity/auth-client' {
  export class AuthClient {
    static create(): Promise<AuthClient>;
    getIdentity(): any;
    login(options: {
      identityProvider: string;
      maxTimeToLive?: bigint;
      onSuccess: () => void;
      onError: (error: Error) => void;
    }): void;
  }
}

declare module '@dfinity/agent' {
  export class Actor {
    static createActor<T>(factory: any, options: any): T;
  }

  export class HttpAgent {
    constructor(options: { host: string; identity?: any });
    fetchRootKey(): Promise<void>;
  }

  export type Identity = any;
}

declare module '@dfinity/principal' {
  export class Principal {
    static fromText(text: string): Principal;
    toText(): string;
    toString(): string;
    toUint8Array(): Uint8Array;
  }
}
