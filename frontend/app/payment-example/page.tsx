"use client";

import React, { useState } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { PaymentProcessor } from "@/components/payment/payment-processor";
import { TransactionHistory } from "@/components/payment/transaction-history";
import { PaymentService } from "@/lib/payment/payment-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function PaymentExamplePage() {
  const { isConnected, principal } = useWalletStore();
  const [recipientPrincipal, setRecipientPrincipal] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Payment for GPU rental");
  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  
  // Initialize payment service
  const paymentService = new PaymentService();
  
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientPrincipal.trim()) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a valid recipient principal ID",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    // Convert ICP to e8s (ledger format)
    const amountE8s = paymentService.icpToE8s(parseFloat(amount));
    
    // Show payment processor
    setShowPaymentForm(false);
    setShowPaymentProcessor(true);
  };
  
  const handlePaymentSuccess = (transactionId: bigint) => {
    console.log("Payment successful with transaction ID:", transactionId.toString());
    // Reset form after delay
    setTimeout(() => {
      setShowPaymentProcessor(false);
      setShowPaymentForm(true);
      setRecipientPrincipal("");
      setAmount("");
    }, 5000);
  };
  
  const handlePaymentCancel = () => {
    setShowPaymentProcessor(false);
    setShowPaymentForm(true);
  };
  
  const checkBalance = async () => {
    if (!isConnected || !principal) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to check your balance",
        variant: "destructive",
      });
      return;
    }
    
    setIsCheckingBalance(true);
    try {
      const balanceE8s = await paymentService.getBalance(principal);
      setBalance(paymentService.formatICP(balanceE8s));
      toast({
        title: "Balance retrieved",
        description: `Your current balance is ${paymentService.formatICP(balanceE8s)} ICP`,
      });
    } catch (error) {
      toast({
        title: "Failed to get balance",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCheckingBalance(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">ICP Payment Integration Example</h1>
        
        {/* Wallet Connect Section */}
        {!isConnected && (
          <div className="mb-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 mb-4">
                  Connect your Internet Computer wallet to make payments and view your transaction history.
                </p>
                <WalletConnect />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Payment Form */}
        {isConnected && showPaymentForm && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Make a Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientPrincipal">Recipient Principal ID</Label>
                    <Input
                      id="recipientPrincipal"
                      placeholder="aaaaa-aa"
                      value={recipientPrincipal}
                      onChange={(e) => setRecipientPrincipal(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                      required
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
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Payment Description</Label>
                    <Input
                      id="description"
                      placeholder="Payment for..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Proceed to Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-zinc-400">Your Principal ID</p>
                    <p className="font-mono text-xs break-all bg-zinc-800 p-2 rounded">{principal?.toString()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">Current Balance</p>
                      {balance ? (
                        <p className="text-xl font-bold">{balance} ICP</p>
                      ) : (
                        <p className="text-zinc-500">Not checked yet</p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={checkBalance}
                      disabled={isCheckingBalance}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      {isCheckingBalance ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "Check Balance"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Payment Processor */}
        {isConnected && showPaymentProcessor && (
          <div className="mb-8">
            <PaymentProcessor
              recipientPrincipal={recipientPrincipal}
              amount={paymentService.icpToE8s(parseFloat(amount))}
              description={description}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        )}
        
        {/* Transaction History */}
        {isConnected && (
          <div className="mb-8">
            <TransactionHistory />
          </div>
        )}
      </div>
    </div>
  );
}
