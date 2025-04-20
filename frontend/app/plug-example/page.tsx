"use client";

import React, { useState } from "react";
import { PlugButton } from "@/components/wallet/plug-button";
import { PlugTransactions } from "@/components/wallet/plug-transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlugWallet, DEFAULT_CANISTER_IDS } from "@/lib/hooks/use-plug-wallet";
import { toast } from "@/components/ui/use-toast";
import { PaymentService } from "@/lib/payment/payment-service";

export default function PlugExamplePage() {
  const {
    isPlugInstalled,
    isConnected,
    principal,
    accountId,
    connect,
    verifyConnection
  } = usePlugWallet({
    autoConnect: true
  });

  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const paymentService = new PaymentService();

  const handleConnect = async () => {
    if (!isPlugInstalled) {
      window.open("https://plugwallet.ooo/", "_blank");
      return;
    }
    
    const success = await connect();
    if (success) {
      toast({
        title: "Connected to Plug",
        description: "Your wallet is now connected",
      });
    }
  };

  const checkBalance = async () => {
    if (!isConnected || !principal) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingBalance(true);
    try {
      // Ensure we're connected with the ledger canister in the whitelist
      await verifyConnection([DEFAULT_CANISTER_IDS[0]]);
      
      // Use type casting to bypass TypeScript issues with Plug's API
      const plugAny = window.ic.plug as any;
      
      // Check if requestBalance method exists
      if (typeof plugAny.requestBalance !== 'function') {
        throw new Error('requestBalance method is not available in this version of Plug wallet');
      }
      
      const balanceE8s = await plugAny.requestBalance();
      
      if (balanceE8s && balanceE8s.length > 0) {
        // Format the balance
        const icpBalance = balanceE8s[0]; // First token should be ICP
        setBalance(`${icpBalance.amount} ${icpBalance.symbol}`);
        
        toast({
          title: "Balance retrieved",
          description: `Your balance: ${icpBalance.amount} ${icpBalance.symbol}`
        });
      } else {
        toast({
          title: "No balance found",
          description: "Could not retrieve balance information",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      toast({
        title: "Balance check failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const formatId = (id: string | null) => {
    if (!id) return "Not connected";
    if (id.length <= 14) return id;
    return `${id.slice(0, 8)}...${id.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Plug Wallet Integration</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Connect with Plug</CardTitle>
              <CardDescription>
                Enhanced Plug wallet connection with native ICP handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <p className="text-zinc-400 mb-2">
                  Status: {isConnected ? (
                    <span className="text-green-500">Connected</span>
                  ) : (
                    <span className="text-red-500">Not connected</span>
                  )}
                </p>
                
                {isConnected && principal && (
                  <div className="space-y-1 text-sm">
                    <p>Principal ID: <span className="font-mono">{formatId(principal.toString())}</span></p>
                    <p>Account ID: <span className="font-mono">{formatId(accountId)}</span></p>
                    {balance && <p>Balance: <span className="font-bold">{balance}</span></p>}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-3">
                <PlugButton 
                  canisterIds={DEFAULT_CANISTER_IDS}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                  buttonText={isConnected ? "Disconnect Plug" : "Connect with Plug"}
                  onConnect={(principal, accountId) => {
                    console.log("Connected with principal:", principal);
                    console.log("Account ID:", accountId);
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {isConnected ? (
            <PlugTransactions 
              onTransferSuccess={(result) => {
                console.log("Transfer successful:", result);
              }}
              onError={(error) => {
                console.error("Transaction error:", error);
              }}
            />
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Connect your wallet to access transaction features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 mb-4">
                  You need to connect your Plug wallet to see your balances and make transactions.
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Usage Guide</CardTitle>
              <CardDescription>
                How to implement Plug wallet in your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Using the Hook</h3>
                <p className="text-zinc-400 text-sm mb-2">
                  Import and use the <code className="bg-zinc-700 px-1 rounded">usePlugWallet</code> hook:
                </p>
                <pre className="bg-zinc-950 p-3 rounded text-xs overflow-x-auto">
                  {`import { usePlugWallet } from "@/lib/hooks/use-plug-wallet";

// In your component
const { 
  isConnected, 
  principal, 
  connect, 
  disconnect 
} = usePlugWallet();`}
                </pre>
              </div>
              
              <div className="bg-zinc-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Using the Components</h3>
                <p className="text-zinc-400 text-sm mb-2">
                  Import and use Plug wallet components:
                </p>
                <pre className="bg-zinc-950 p-3 rounded text-xs overflow-x-auto">
                  {`// Connection button
import { PlugButton } from "@/components/wallet/plug-button";

// Transactions component
import { PlugTransactions } from "@/components/wallet/plug-transactions";

// In your JSX
<PlugButton canisterIds={["ryjl3-tyaaa-aaaaa-aaaba-cai"]} />
<PlugTransactions onTransferSuccess={handleSuccess} />`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
