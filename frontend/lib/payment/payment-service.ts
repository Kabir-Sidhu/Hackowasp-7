import { Principal } from "@dfinity/principal";
import { 
  icrcGetBalance, 
  icrcTransfer, 
  transferTokensFromPlug, 
  createActor,
  icrcLedgerAbi
} from "@/lib/wallet/wallet-utils";
import { IcrcLedgerActor } from "@/lib/wallet/types";
import { Identity } from "@dfinity/agent";

// Default ICP Ledger canister ID - replace with actual value if needed
const ICP_LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
// The default fee for ICP transfers in e8s
const DEFAULT_FEE = BigInt(10000);

export interface PaymentResult {
  transactionId: bigint;
  status: 'success' | 'error';
  message?: string;
}

export class PaymentService {
  private ledgerCanisterId: string;
  
  constructor(ledgerCanisterId: string = ICP_LEDGER_CANISTER_ID) {
    this.ledgerCanisterId = ledgerCanisterId;
  }
  
  /**
   * Get the balance of a user's account
   * @param principal The principal of the user
   * @param identity Optional identity for authenticated requests
   * @returns Promise resolving to the balance in e8s
   */
  async getBalance(principal: Principal, identity?: Identity): Promise<bigint> {
    try {
      return await icrcGetBalance(this.ledgerCanisterId, principal, identity);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }
  
  /**
   * Make a payment using the appropriate method based on wallet type
   * @param params Payment parameters 
   * @returns Promise resolving to payment result
   */
  async makePayment(params: {
    amount: bigint;
    fromPrincipal: Principal;
    toPrincipal: Principal | string;
    walletType: 'internetIdentity' | 'nfid' | 'plug' | null;
    identity?: Identity;
    memo?: Uint8Array;
  }): Promise<PaymentResult> {
    const { amount, fromPrincipal, toPrincipal, walletType, identity, memo } = params;
    
    try {
      let transactionId: bigint;
      
      // Convert to Principal object if string was provided
      const recipientPrincipal = typeof toPrincipal === 'string' 
        ? Principal.fromText(toPrincipal)
        : toPrincipal;
      
      if (walletType === 'plug') {
        // Use Plug wallet's built-in transfer method
        const accountId = typeof toPrincipal === 'string' 
          ? toPrincipal 
          : toPrincipal.toString();
          
        transactionId = await transferTokensFromPlug(
          this.ledgerCanisterId,
          accountId,
          amount
        );
      } else {
        // Use our custom transfer method for Internet Identity and NFID
        transactionId = await icrcTransfer(
          this.ledgerCanisterId,
          {
            tokens: amount,
            from: fromPrincipal,
            to: recipientPrincipal
          },
          identity
        );
      }
      
      return {
        transactionId,
        status: 'success'
      };
    } catch (error) {
      console.error("Payment failed:", error);
      return {
        transactionId: BigInt(0),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Format an amount from e8s (ledger unit) to ICP (display unit)
   * @param e8s Amount in e8s
   * @returns Formatted ICP amount as a string
   */
  formatICP(e8s: bigint): string {
    const icpValue = Number(e8s) / 100000000;
    return icpValue.toFixed(8);
  }
  
  /**
   * Convert ICP to e8s
   * @param icp Amount in ICP
   * @returns Equivalent amount in e8s
   */
  icpToE8s(icp: number): bigint {
    return BigInt(Math.floor(icp * 100000000));
  }
  
  /**
   * Fetch recent transactions for a principal
   * @param principal The principal to fetch transactions for
   * @param identity Optional identity for authenticated requests
   * @returns Promise resolving to transaction history
   */
  async getTransactionHistory(principal: Principal, identity?: Identity): Promise<any[]> {
    try {
      // This is a placeholder. In a real implementation, you would query
      // the ledger canister for transaction history.
      
      // Create actor with the provided identity
      const ledgerActor = createActor<IcrcLedgerActor>(
        this.ledgerCanisterId,
        icrcLedgerAbi,
        identity
      );
      
      // Note: The actual implementation would depend on the specific
      // methods available in the ICP Ledger canister or your own
      // transaction indexing canister.
      
      // This is just mock data for now
      return [
        {
          id: "1234567890",
          amount: "0.5",
          fromPrincipal: principal.toString(),
          toPrincipal: "aaaaa-aa",
          timestamp: Date.now() - 3600000,
          status: 'completed',
          isOutgoing: true
        },
        {
          id: "9876543210",
          amount: "1.25",
          fromPrincipal: "bbbbb-bb",
          toPrincipal: principal.toString(),
          timestamp: Date.now() - 86400000,
          status: 'completed',
          isOutgoing: false
        }
      ];
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw error;
    }
  }
}
