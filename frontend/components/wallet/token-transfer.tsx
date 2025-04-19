"use client";

import { useState } from "react";
import { Principal } from "@dfinity/principal";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { icrcTransfer, transferTokensFromPlug } from "@/lib/wallet/wallet-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenTransferProps {
  ledgerCanisterId: string;
  defaultAmount?: string;
  onSuccessCallback?: (blockIndex: bigint) => void;
  onErrorCallback?: (error: any) => void;
}

export function TokenTransfer({
  ledgerCanisterId,
  defaultAmount = "0.01",
  onSuccessCallback,
  onErrorCallback,
}: TokenTransferProps) {
  const [recipientPrincipal, setRecipientPrincipal] = useState("");
  const [amount, setAmount] = useState(defaultAmount);
  const [isTransferring, setIsTransferring] = useState(false);
  const [result, setResult] = useState<{ success?: bigint; error?: string }>({});
  
  const { isConnected, principal, walletType, accountId } = useWalletStore();

  const handleTransfer = async () => {
    if (!isConnected || !principal) {
      setResult({ error: "Wallet not connected" });
      if (onErrorCallback) onErrorCallback("Wallet not connected");
      return;
    }

    if (!recipientPrincipal || !amount) {
      setResult({ error: "Recipient and amount are required" });
      if (onErrorCallback) onErrorCallback("Missing required fields");
      return;
    }

    let recipientPrincipalObj: Principal;
    try {
      recipientPrincipalObj = Principal.fromText(recipientPrincipal);
    } catch (error) {
      setResult({ error: "Invalid recipient principal" });
      if (onErrorCallback) onErrorCallback("Invalid recipient principal");
      return;
    }

    const amountBigInt = BigInt(Number(amount) * 10 ** 8); // Convert to e8s (assuming 8 decimals)

    try {
      setIsTransferring(true);
      setResult({});

      let blockIndex: bigint;

      if (walletType === "plug") {
        // If using Plug wallet, use the Plug wallet's transfer method
        blockIndex = await transferTokensFromPlug(
          ledgerCanisterId,
          recipientPrincipal, // Plug can accept principal ID as recipient
          amountBigInt
        );
      } else {
        // For other wallet types, use our icrcTransfer implementation
        blockIndex = await icrcTransfer(
          ledgerCanisterId,
          {
            tokens: amountBigInt,
            from: principal,
            to: recipientPrincipalObj,
          }
        );
      }

      setResult({ success: blockIndex });
      if (onSuccessCallback) onSuccessCallback(blockIndex);
    } catch (error: any) {
      console.error("Transfer error:", error);
      setResult({ error: error.message || "Transfer failed" });
      if (onErrorCallback) onErrorCallback(error);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Transfer Tokens</CardTitle>
        <CardDescription>Send tokens to another user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Principal ID</Label>
            <Input
              id="recipient"
              placeholder="aaaaa-aa"
              value={recipientPrincipal}
              onChange={(e) => setRecipientPrincipal(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
          
          {result.success && (
            <div className="bg-green-900/20 text-green-400 p-3 rounded-md text-sm">
              Transfer successful! Block Index: {result.success.toString()}
            </div>
          )}
          
          {result.error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-md text-sm">
              Error: {result.error}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleTransfer}
          disabled={isTransferring || !isConnected}
          className="bg-purple-600 hover:bg-purple-700 w-full"
        >
          {isTransferring ? "Processing..." : "Transfer Tokens"}
        </Button>
      </CardFooter>
    </Card>
  );
}
