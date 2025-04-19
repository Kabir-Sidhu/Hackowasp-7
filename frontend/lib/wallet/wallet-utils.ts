import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { 
  IcrcLedgerActor, 
  TokenTransferArgs, 
  TransferFromArgs 
} from './types';

// Constants
const II_LOCAL_URL = 'http://localhost:8000?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai';
const II_MAINNET_URL = 'https://identity.ic0.app';
const NFID_URL = 'https://nfid.one/authenticate';
const IS_LOCAL = process.env.NODE_ENV !== 'production';

// Local host for development
const LOCAL_HOST = 'http://localhost:8000';
const IC_HOST = 'https://ic0.app';

// ICRC1 Ledger methods
export const icrcLedgerAbi = ({ IDL }: any) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });

  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const Duration = IDL.Record({ secs: IDL.Nat64, nanos: IDL.Nat32 });
  const Allowance = IDL.Record({
    allowance: IDL.Nat,
    expires_at: IDL.Opt(IDL.Nat64),
  });

  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat], ['query']),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
    icrc1_name: IDL.Func([], [IDL.Text], ['query']),
    icrc1_symbol: IDL.Func([], [IDL.Text], ['query']),
    icrc1_total_supply: IDL.Func([], [IDL.Nat], ['query']),
    icrc1_transfer: IDL.Func(
      [
        IDL.Record({
          to: Account,
          fee: IDL.Opt(IDL.Nat),
          memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
          from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          created_at_time: IDL.Opt(IDL.Nat64),
          amount: IDL.Nat,
        }),
      ],
      [
        IDL.Variant({
          Ok: IDL.Nat,
          Err: IDL.Variant({
            BadFee: IDL.Record({ expected_fee: IDL.Nat }),
            InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
            GenericError: IDL.Record({
              message: IDL.Text,
              error_code: IDL.Nat,
            }),
          }),
        }),
      ],
      [],
    ),
    icrc2_approve: IDL.Func(
      [
        IDL.Record({
          fee: IDL.Opt(IDL.Nat),
          memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
          from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          created_at_time: IDL.Opt(IDL.Nat64),
          amount: IDL.Nat,
          expected_allowance: IDL.Opt(IDL.Nat),
          expires_at: IDL.Opt(IDL.Nat64),
          spender: Account,
        }),
      ],
      [
        IDL.Variant({
          Ok: IDL.Nat,
          Err: IDL.Variant({
            BadFee: IDL.Record({ expected_fee: IDL.Nat }),
            InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
            AllowanceChanged: IDL.Record({ current_allowance: IDL.Nat }),
            GenericError: IDL.Record({
              message: IDL.Text,
              error_code: IDL.Nat,
            }),
            TemporarilyUnavailable: IDL.Null,
            Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
            TooOld: IDL.Null,
            CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
            Expired: IDL.Record({ ledger_time: IDL.Nat64 }),
          }),
        }),
      ],
      [],
    ),
    icrc2_allowance: IDL.Func(
      [IDL.Record({ account: Account, spender: Account })],
      [Allowance],
      ['query'],
    ),
  });
};

// Internet Identity authentication
export const connectToInternetIdentity = async (): Promise<{
  principal: Principal;
  identity: Identity;
}> => {
  const authClient = await AuthClient.create();
  
  return new Promise((resolve, reject) => {
    authClient.login({
      identityProvider: IS_LOCAL ? II_LOCAL_URL : II_MAINNET_URL,
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        resolve({ principal, identity });
      },
      onError: (error) => {
        reject(new Error(`Internet Identity login failed: ${error}`));
      },
    });
  });
};

// NFID authentication
export const connectToNFID = async (): Promise<{
  principal: Principal;
  identity: Identity;
}> => {
  const authClient = await AuthClient.create();
  
  return new Promise((resolve, reject) => {
    authClient.login({
      identityProvider: NFID_URL,
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        resolve({ principal, identity });
      },
      onError: (error) => {
        reject(new Error(`NFID login failed: ${error}`));
      },
    });
  });
};

// Plug Wallet connection
export const connectToPlugWallet = async (whitelist: string[] = [], host?: string): Promise<{
  principal: Principal;
  accountId: string;
}> => {
  // Check if Plug is installed
  if (!window.ic?.plug) {
    throw new Error('Plug wallet is not installed');
  }

  // Request connection to Plug
  const connected = await window.ic.plug.requestConnect({
    whitelist,
    host: host || (IS_LOCAL ? LOCAL_HOST : IC_HOST),
  });

  if (!connected) {
    throw new Error('Failed to connect to Plug wallet');
  }

  // Get the agent and principal
  const principal = await window.ic.plug.agent.getPrincipal();
  
  // Get account ID - derive it from principal if getAccountId doesn't exist
  let accountId;
  if (typeof window.ic.plug.getAccountId === 'function') {
    accountId = await window.ic.plug.getAccountId();
  } else if (window.ic.plug.accountId) {
    accountId = await window.ic.plug.accountId();
  } else {
    // Fallback: derive account ID from principal
    accountId = principalToAccountIdentifier(principal);
  }

  return { principal, accountId };
};

// Create actor with identity
export const createActor = <T>(
  canisterId: string,
  idlFactory: any,
  identity?: Identity
): T => {
  const agent = new HttpAgent({
    host: IS_LOCAL ? LOCAL_HOST : IC_HOST,
    identity,
  });

  // When in development, we need to fetch the root key
  if (IS_LOCAL) {
    agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Check if your local replica is running');
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  }) as unknown as T;
};

// ICRC2 token approval for allowing another canister to transfer tokens on behalf of the user
export const approveIcrc2TokenSpend = async (
  ledgerCanisterId: string,  // Token ledger canister ID
  spenderCanisterId: string, // Canister that will be allowed to spend tokens
  amount: bigint,            // Amount of tokens to approve
  identity: Identity,        // User's identity
  opts?: {
    fee?: bigint;           // Optional fee
    memo?: Uint8Array;      // Optional memo
    fromSubaccount?: Uint8Array; // Optional subaccount
    expiresAt?: bigint;     // Optional expiration time
  }
): Promise<bigint> => {
  // Create actor for the token ledger with explicit typing
  const tokenActor = createActor<{
    icrc2_approve: (args: any) => Promise<{ Ok?: bigint; Err?: any }>
  }>(
    ledgerCanisterId,
    icrcLedgerAbi,
    identity
  );

  // Convert canister ID to account format
  const spenderAccount = {
    owner: Principal.fromText(spenderCanisterId),
    subaccount: opts?.fromSubaccount ? [opts.fromSubaccount] : []
  };

  // Prepare approval arguments
  const approvalArgs = {
    spender: spenderAccount,
    amount: amount,
    fee: opts?.fee ? [opts.fee] : [],
    memo: opts?.memo ? [opts.memo] : [],
    from_subaccount: opts?.fromSubaccount ? [opts.fromSubaccount] : [],
    expires_at: opts?.expiresAt ? [opts.expiresAt] : [],
    expected_allowance: [],
    created_at_time: []
  };

  try {
    // Call the icrc2_approve method on the token ledger
    const result = await tokenActor.icrc2_approve(approvalArgs);
    
    if (result && typeof result === 'object' && 'Ok' in result && result.Ok !== undefined) {
      return result.Ok;
    } else if (result && typeof result === 'object' && 'Err' in result) {
      throw new Error(`Token approval failed: ${JSON.stringify(result.Err)}`);
    } else {
      throw new Error('Unknown response format from token approval');
    }
  } catch (error) {
    console.error('Error during token approval:', error);
    throw error;
  }
};

// Helper function to approve tokens from Plug wallet
export const approveTokensFromPlug = async (
  ledgerCanisterId: string,
  spenderCanisterId: string,
  amount: bigint,
): Promise<bigint> => {
  if (!window.ic?.plug) {
    throw new Error('Plug wallet is not installed');
  }
  
  // Type check for requestCall method
  if (typeof window.ic.plug.requestCall !== 'function') {
    throw new Error('Plug wallet version does not support requestCall method');
  }
  
  // Make sure Plug is connected
  const isConnected = await window.ic.plug.isConnected();
  if (!isConnected) {
    throw new Error('Plug wallet is not connected');
  }
  
  // Make sure the ledger canister is in the whitelist
  await window.ic.plug.requestConnect({
    whitelist: [ledgerCanisterId, spenderCanisterId],
  });
  
  // Prepare the approval arguments
  const spenderAccount = {
    owner: Principal.fromText(spenderCanisterId),
    subaccount: []
  };
  
  const approvalArgs = {
    spender: spenderAccount,
    amount: amount,
    fee: [],
    memo: [],
    from_subaccount: [],
    expires_at: [],
    expected_allowance: [],
    created_at_time: []
  };
  
  try {
    // Call the icrc2_approve method through Plug wallet with type assertion
    const requestCallFn = window.ic.plug.requestCall as (
      params: {
        canisterId: string;
        methodName: string;
        args: any[];
        onSuccess?: (response: any) => any;
        onFail?: (error: any) => any;
      }
    ) => Promise<any>;
    
    const result = await requestCallFn({
      canisterId: ledgerCanisterId,
      methodName: 'icrc2_approve',
      args: [approvalArgs],
      onSuccess: (response: any) => response,
      onFail: (error: any) => { throw new Error(`Plug approval failed: ${error}`) }
    });
    
    // Parse the response
    if (result && typeof result === 'object' && 'Ok' in result) {
      return BigInt(result.Ok.toString());
    } else if (result && typeof result === 'object' && 'Err' in result) {
      throw new Error(`Token approval failed: ${JSON.stringify(result.Err)}`);
    } else {
      return BigInt(result.toString());
    }
  } catch (error) {
    console.error('Error during Plug token approval:', error);
    throw error;
  }
};

// Implementation of the icrc_transfer function from the Rust code
export async function icrcTransfer(
  ledgerCanisterId: string,
  args: TokenTransferArgs,
  identity?: Identity
): Promise<bigint> {
  // Create the token actor with the provided identity
  const tokenActor = createActor<IcrcLedgerActor>(
    ledgerCanisterId,
    icrcLedgerAbi,
    identity
  );

  // Create the transfer arguments according to the ICRC2 standard
  const transferArgs: TransferFromArgs = {
    amount: args.tokens,
    to: {
      owner: args.to,
      subaccount: [],
    },
    fee: [],
    memo: [],
    created_at_time: [],
    spender_subaccount: [],
    from: {
      owner: args.from,
      subaccount: [],
    },
  };

  try {
    // Call the icrc2_transfer_from method on the token ledger
    const result = await tokenActor.icrc2_transfer_from(transferArgs);
    
    if ('Ok' in result) {
      return result.Ok;
    } else if ('Err' in result) {
      throw new Error(`Token transfer failed: ${JSON.stringify(result.Err)}`);
    } else {
      throw new Error('Unknown response format from token transfer');
    }
  } catch (error) {
    console.error('Error during token transfer:', error);
    throw error;
  }
}

// Implementation of the icrc_get_balance function from the Rust code
export async function icrcGetBalance(
  ledgerCanisterId: string,
  principalId: Principal,
  identity?: Identity
): Promise<bigint> {
  // Create the token actor with the provided identity
  const tokenActor = createActor<IcrcLedgerActor>(
    ledgerCanisterId,
    icrcLedgerAbi,
    identity
  );

  try {
    // Call the icrc1_balance_of method on the token ledger
    const balance = await tokenActor.icrc1_balance_of({
      owner: principalId,
      subaccount: [],
    });
    
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw new Error(`Failed to get balance: ${error}`);
  }
}

// Helper function to transfer tokens from Plug wallet
export async function transferTokensFromPlug(
  ledgerCanisterId: string,
  toAccountId: string,
  amount: bigint,
): Promise<bigint> {
  if (!window.ic?.plug) {
    throw new Error('Plug wallet is not installed');
  }
  
  // Make sure Plug is connected
  const isConnected = await window.ic.plug.isConnected();
  if (!isConnected) {
    throw new Error('Plug wallet is not connected');
  }
  
  // Make sure the ledger canister is in the whitelist
  await window.ic.plug.requestConnect({
    whitelist: [ledgerCanisterId],
  });
  
  try {
    // Call the requestTransfer method through Plug wallet
    const result = await window.ic.plug.requestTransfer({
      to: toAccountId,
      amount: Number(amount),
      opts: {
        fee: 10000, // Standard ICP fee in e8s
      },
    });
    
    if (result && typeof result === 'object' && 'height' in result) {
      return BigInt(result.height);
    } else {
      throw new Error('Invalid transfer result');
    }
  } catch (error) {
    console.error('Error during Plug token transfer:', error);
    throw error;
  }
}

// Helper to derive an account ID from a principal
export function principalToAccountIdentifier(
  principal: Principal,
  subAccount?: Uint8Array
): string {
  // Implementation of the account ID derivation
  // This is a simplified version and may need to be expanded
  const bytes = Buffer.from("\x0Aaccount-id");
  const principalBytes = principal.toUint8Array();
  const buff = Buffer.concat([
    bytes,
    Buffer.from(principalBytes),
    Buffer.from(subAccount || new Uint8Array(32))
  ]);
  
  // Create a SHA224 hash and return it as a hex string
  // Note: This is a placeholder. In a real implementation, you'd compute the SHA224 hash
  return buff.toString('hex');
}
