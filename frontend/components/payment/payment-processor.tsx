"use client";

import React, { useState } from "react";
import { Principal } from "@dfinity/principal";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { icrcTransfer, transferTokensFromPlug } from "@/lib/wallet/wallet-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const MotionButton = motion.create(Button);

// Default ICP Ledger canister ID - replace with actual value for production
const ICP_LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

interface PaymentProcessorProps {
  recipientPrincipal: string;
  amount: bigint;
  description: string;
  onSuccess?: (transactionId: bigint) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export function PaymentProcessor({
  recipientPrincipal,
  amount,
  description,
  onSuccess,
  onError,
  onCancel
}: PaymentProcessorProps) {
  const { isConnected, principal, walletType, accountId } = useWalletStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<bigint | null>(null);
  
  const formatAmount = (amount: bigint) => {
    // Convert e8s to ICP (divide by 10^8)
    const icpValue = Number(amount) / 100000000;
    return icpValue.toFixed(8);
  };

  async function handlePayment() {
    if (!isConnected || !principal) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      let txId: bigint;
      const recipientPrincipalObj = Principal.fromText(recipientPrincipal);

      if (walletType === "plug") {
        // Use Plug's built-in transfer method
        txId = await transferTokensFromPlug(
          ICP_LEDGER_CANISTER_ID,
          recipientPrincipal,
          amount
        );
      } else {
        // Use our custom transfer method for Internet Identity and NFID
        txId = await icrcTransfer(
          ICP_LEDGER_CANISTER_ID,
          {
            tokens: amount,
            from: principal,
            to: recipientPrincipalObj
          }
        );
      }

      setTransactionId(txId);
      toast({
        title: "Payment successful",
        description: `Transaction ID: ${txId.toString()}`,
      });
      
      if (onSuccess) {
        onSuccess(txId);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Payment Required</CardTitle>
          <CardDescription>
            Please connect your wallet to make a payment
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (transactionId) {
    return (
      <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-green-500">Payment Successful</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-800 rounded-md">
              <p className="text-sm text-zinc-400">Transaction ID</p>
              <p className="font-mono text-xs break-all">{transactionId.toString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Amount</span>
                <span className="font-bold">{formatAmount(amount)} ICP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Recipient</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{recipientPrincipal}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Confirm Payment</CardTitle>
        <CardDescription>
          Review the details below to complete your payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-zinc-800 p-4 rounded-md">
            <h3 className="font-medium mb-2">{description}</h3>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Amount</span>
              <span className="text-xl font-bold">{formatAmount(amount)} ICP</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input 
              id="recipient" 
              value={recipientPrincipal} 
              readOnly 
              className="bg-zinc-800 border-zinc-700"
            />
            <p className="text-xs text-zinc-500">
              Principal ID of the payment recipient
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button 
          variant="outline" 
          className="w-1/2" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <MotionButton
          className="w-1/2 bg-purple-600 hover:bg-purple-700"
          onClick={handlePayment}
          disabled={isProcessing}
          whileHover={{ scale: 1.02, backgroundColor: "#7e22ce" }}
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Payment"
          )}
        </MotionButton>
      </CardFooter>
    </Card>
  );
}
