"use client";

import React, { useState } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { approveTokensFromPlug, approveIcrc2TokenSpend } from "@/lib/wallet/wallet-utils";
import { Principal } from "@dfinity/principal";
import { Button } from "@/components/ui/button";

interface TokenApprovalProps {
  // The canister ID of the token ledger (e.g., ICP ledger)
  ledgerCanisterId: string;
  // The canister ID that will be allowed to spend tokens on user's behalf (e.g., GPULend backend)
  spenderCanisterId: string;
  // The amount to approve (in e8s for ICP - 1 ICP = 10^8 e8s)
  amount: string;
  // Optional callback after successful approval
  onSuccess?: (blockIndex: bigint) => void;
}

export function TokenApproval({ 
  ledgerCanisterId, 
  spenderCanisterId, 
  amount,
  onSuccess 
}: TokenApprovalProps) {
  const { isConnected, walletType, principal } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const handleApproveTokens = async () => {
    if (!isConnected || !principal) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxId(null);

    try {
      // Convert amount to bigint (e8s)
      const amountBigInt = BigInt(amount);
      
      // Use different approval methods based on wallet type
      let blockIndex: bigint;
      
      if (walletType === "plug") {
        // For Plug wallet, use the specialized method
        blockIndex = await approveTokensFromPlug(
          ledgerCanisterId,
          spenderCanisterId,
          amountBigInt
        );
      } else {
        // For Internet Identity and NFID, use the general method
        // Note: In a real app, you'd need to get the identity from auth client
        setError("Direct token approval is currently only supported for Plug wallet");
        setIsLoading(false);
        return;
      }
      
      // Set the transaction ID and call the success callback
      setTxId(blockIndex.toString());
      onSuccess?.(blockIndex);
    } catch (err: any) {
      setError(err.message || "Failed to approve tokens");
      console.error("Token approval error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-md border border-yellow-700 bg-yellow-900/20 p-4 my-4">
        <p className="text-yellow-300">Please connect your wallet to approve token transfers.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-900 p-4 my-4">
      <h3 className="text-lg font-semibold mb-2">Approve Token Transfer</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Allow the GPULend service to transfer {parseFloat(amount) / 10**8} ICP tokens from your account.
      </p>
      
      {error && (
        <div className="rounded-md border border-red-700 bg-red-900/20 p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      {txId && (
        <div className="rounded-md border border-green-700 bg-green-900/20 p-3 mb-4">
          <p className="text-sm text-green-400">
            Approval successful! Transaction ID: {txId}
          </p>
        </div>
      )}
      
      <Button
        onClick={handleApproveTokens}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700 w-full"
      >
        {isLoading ? "Approving..." : `Approve ${parseFloat(amount) / 10**8} ICP`}
      </Button>
      
      <p className="text-xs text-zinc-500 mt-2">
        This approval allows the GPULend service to transfer tokens on your behalf
        when you rent GPU resources. You will not be charged until you actually use the service.
      </p>
    </div>
  );
}
