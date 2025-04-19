declare module '@nfid/embed' {
  export interface NfidOptions {
    host?: string;
    appName?: string;
  }

  export interface NfidResponse {
    identity: any;
    principal: any;
  }

  export default class NFID {
    constructor(options?: NfidOptions);
    login(): Promise<NfidResponse>;
    isAuthenticated(): Promise<boolean>;
    logout(): Promise<void>;
  }
}
