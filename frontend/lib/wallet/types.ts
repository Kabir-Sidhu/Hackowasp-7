import { JsonObject } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';

// ICRC2 token types
export interface Account {
  owner: any; // Principal
  subaccount: Uint8Array[];
}

// Token transfer arguments for our application
export interface TokenTransferArgs {
  tokens: bigint;
  from: Principal;
  to: Principal;
}

export interface Icrc2ApproveArgs {
  spender: Account;
  amount: bigint;
  fee?: bigint[];
  memo?: Uint8Array[];
  from_subaccount?: Uint8Array[];
  expires_at?: bigint[];
  expected_allowance?: bigint[];
  created_at_time?: bigint[];
}

export interface Icrc2ApproveResult {
  Ok?: bigint;
  Err?: {
    BadFee?: { expected_fee: bigint };
    InsufficientFunds?: { balance: bigint };
    AllowanceChanged?: { current_allowance: bigint };
    GenericError?: { message: string; error_code: number };
    TemporarilyUnavailable?: null;
    Duplicate?: { duplicate_of: bigint };
    TooOld?: null;
    CreatedInFuture?: { ledger_time: bigint };
    Expired?: { ledger_time: bigint };
  };
}

// Interface for ICRC2 Transfer From arguments
export interface TransferFromArgs {
  from: Account;
  to: Account;
  amount: bigint;
  fee?: bigint[];
  memo?: Uint8Array[];
  created_at_time?: bigint[];
  spender_subaccount?: Uint8Array[];
}

// Interface for ICRC2 Transfer From errors
export interface TransferFromError {
  BadFee?: { expected_fee: bigint };
  BadBurn?: { min_burn_amount: bigint };
  InsufficientFunds?: { balance: bigint };
  InsufficientAllowance?: { allowance: bigint };
  TooOld?: null;
  CreatedInFuture?: { ledger_time: bigint };
  Duplicate?: { duplicate_of: bigint };
  TemporarilyUnavailable?: null;
  GenericError?: { message: string; error_code: number };
}

export interface Icrc1TransferArgs {
  to: Account;
  fee?: bigint[];
  memo?: Uint8Array[];
  from_subaccount?: Uint8Array[];
  created_at_time?: bigint[];
  amount: bigint;
}

export interface Icrc1TransferError {
  BadFee?: { expected_fee: bigint };
  InsufficientFunds?: { balance: bigint };
  GenericError?: { message: string; error_code: number };
  TemporarilyUnavailable?: null;
  Duplicate?: { duplicate_of: bigint };
  TooOld?: null;
  CreatedInFuture?: { ledger_time: bigint };
}

export interface IcrcLedgerActor {
  icrc1_balance_of: (account: Account) => Promise<bigint>;
  icrc1_decimals: () => Promise<number>;
  icrc1_name: () => Promise<string>;
  icrc1_symbol: () => Promise<string>;
  icrc1_total_supply: () => Promise<bigint>;
  icrc1_transfer: (args: Icrc1TransferArgs) => Promise<{ Ok: bigint } | { Err: Icrc1TransferError }>;
  icrc2_approve: (args: Icrc2ApproveArgs) => Promise<Icrc2ApproveResult>;
  icrc2_allowance: (args: { account: Account; spender: Account }) => Promise<{ allowance: bigint; expires_at: bigint[] }>;
  icrc2_transfer_from: (args: TransferFromArgs) => Promise<{ Ok: bigint } | { Err: TransferFromError }>;
}

// Plug wallet request call interface
export interface PlugRequestCallParams {
  canisterId: string;
  methodName: string;
  args: any[];
  onSuccess?: (response: any) => any;
  onFail?: (error: any) => any;
}

// Extended Window interface for Plug Wallet
declare global {
  interface Window {
    ic?: {
      plug?: {
        agent: any;
        getPrincipal: () => Promise<Principal>;
        isConnected: () => Promise<boolean>;
        requestConnect: (options?: {
          whitelist?: string[];
          host?: string;
        }) => Promise<boolean>;
        createActor: (options: {
          canisterId: string;
          interfaceFactory: any;
        }) => Promise<any>;
        requestTransfer: (params: {
          to: string;
          amount: number;
          opts?: {
            fee?: number;
            memo?: number;
            from_subaccount?: number;
            created_at_time?: {
              timestamp_nanos: number;
            };
          };
        }) => Promise<{ height: number }>;
        accountId: () => Promise<string>;
        requestBalance: () => Promise<Array<{
          amount: number;
          canisterId: string;
          image: string;
          name: string;
          symbol: string;
          value: number | null;
        }>>;
        requestBurnXTC: (params: {
          amount: number;
          to: Principal;
        }) => Promise<any>;
        signMessage: (message: {
          chainType: string | "ICP";
          domain: string;
          address: string;
          message: string;
          publicKey: string;
        }) => Promise<{
          chainType: "ICP";
          domain: string;
          address: string;
          message: string;
          publicKey: string;
          signature: string;
        }>;
        batchTransactions: (transactions: {
          idl: any;
          canisterId: string;
          methodName: string;
          args: JsonObject;
          onSuccess: (res: any) => void;
          onFail: (err: Error) => void;
        }[]) => void;
      };
    };
  }
}
