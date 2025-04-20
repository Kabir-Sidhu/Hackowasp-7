"use client";

import React, { useState } from "react";
import { usePlugWallet } from "@/lib/hooks/use-plug-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { safeRequestBalance, safeRequestTransfer } from "@/lib/wallet/extension-helper";

interface TokenBalance {
  amount: number;
  canisterId: string;
  image: string;
  name: string;
  symbol: string;
  value: number | null;
}

interface PlugTransactionsProps {
  onTransferSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export function PlugTransactions({ onTransferSuccess, onError }: PlugTransactionsProps) {
  const { isConnected, principal } = usePlugWallet();
  
  const [balances, setBalances] = useState<TokenBalance[] | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  
  const fetchBalances = async () => {
    if (!isConnected || !window?.ic?.plug) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Plug wallet first",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingBalances(true);
    try {
      // Use our safe extension helper to prevent runtime errors
      const balanceResponse = await safeRequestBalance();
      setBalances(balanceResponse);
      
      toast({
        title: "Balances retrieved",
        description: `Found ${balanceResponse.length} token(s) in your wallet`,
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      
      const errMsg = error instanceof Error ? error.message : String(error);
      
      // Provide specific messages for common extension errors
      if (errMsg.includes('chrome.runtime.sendMessage') || 
          errMsg.includes('Extension ID') || 
          errMsg.includes('runtime.sendMessage')) {
        
        toast({
          title: "Extension Communication Error",
          description: "Unable to communicate with Plug wallet. Please open the Plug wallet extension and reload this page.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to fetch balances",
          description: errMsg || "Unknown error occurred",
          variant: "destructive",
        });
      }
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoadingBalances(false);
    }
  };
  
  const handleTransfer = async () => {
    if (!isConnected || !window?.ic?.plug) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Plug wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (!recipientAddress) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    setIsTransferring(true);
    setTransferResult(null);
    
    try {
      // Convert ICP tokens to e8s (1 ICP = 100,000,000 e8s)
      const amountE8s = Math.floor(amount * 100000000);
      
      // Prepare transfer parameters according to documentation
      const transferParams: any = {
        to: recipientAddress,
        amount: amountE8s,
      };
      
      // Add optional memo if provided (in opts object as per Plug docs)
      if (memo) {
        transferParams.opts = {
          memo: memo
        };
      }
      
      console.log("Sending transfer with params:", transferParams);
      
      // Use our safe extension helper to prevent runtime errors
      const result = await safeRequestTransfer(transferParams);
      
      console.log("Transfer result:", result);
      setTransferResult(result);
      
      toast({
        title: "Transfer successful",
        description: `Transaction confirmed at block height: ${result.height}`,
      });
      
      if (onTransferSuccess) {
        onTransferSuccess(result);
      }
      
      // Reset form
      setTransferAmount("");
      setRecipientAddress("");
      setMemo("");
    } catch (error) {
      console.error("Transfer error:", error);
      
      const errMsg = error instanceof Error ? error.message : String(error);
      
      // Check for extension messaging errors
      if (errMsg.includes('chrome.runtime.sendMessage') || 
          errMsg.includes('Extension ID') || 
          errMsg.includes('runtime.sendMessage')) {
        
        toast({
          title: "Extension Communication Error",
          description: "Unable to communicate with Plug wallet. Please open the Plug wallet extension and reload this page.",
          variant: "destructive",
        });
      } else if (errMsg.includes('User rejected')) {
        toast({
          title: "Transaction Rejected",
          description: "You rejected the transaction in Plug wallet.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transfer failed",
          description: errMsg || "Unknown error occurred",
          variant: "destructive",
        });
      }
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsTransferring(false);
    }
  };
  
  if (!isConnected) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Wallet Transactions</CardTitle>
          <CardDescription>
            Connect your Plug wallet to view balances and make transfers
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wallet Transactions</CardTitle>
            <CardDescription>
              Check balances and make transfers with Plug
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchBalances}
            disabled={isLoadingBalances}
            className="border-zinc-700 hover:bg-zinc-800"
          >
            {isLoadingBalances ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Balances Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Your Balances</h3>
          
          {isLoadingBalances ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : balances && balances.length > 0 ? (
            <div className="space-y-3">
              {balances.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-md">
                  <div className="flex items-center gap-2">
                    {token.image ? (
                      <img 
                        src={token.image} 
                        alt={token.symbol} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-xs font-bold">
                        {token.symbol?.substring(0, 2) || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{token.name}</p>
                      <p className="text-xs text-zinc-400">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{token.amount}</p>
                    {token.value && (
                      <p className="text-xs text-zinc-400">${token.value.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : balances && balances.length === 0 ? (
            <p className="text-center py-4 text-zinc-500">No tokens found in your wallet</p>
          ) : (
            <p className="text-center py-4 text-zinc-500">Click the refresh button to load your balances</p>
          )}
        </div>
        
        {/* Transfer Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Make a Transfer</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="Principal ID or Account ID"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ICP)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0.00000001"
                placeholder="0.00000000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">
                Amount in ICP tokens (1 ICP = 100,000,000 e8s)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Input
                id="memo"
                placeholder="Transaction memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
        </div>
        
        {/* Result Section */}
        {transferResult && (
          <div className="p-4 bg-zinc-800 rounded-md">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-green-500">Transfer Successful</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Block Height:</span>
                <span className="font-mono">{transferResult.height}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={handleTransfer}
          disabled={isTransferring || !recipientAddress || !transferAmount}
        >
          {isTransferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Send Transaction"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
