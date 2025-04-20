"use client";

import React, { useEffect, useState } from "react";
import { useWalletStore } from "@/lib/stores/wallet-store";
import { Principal } from "@dfinity/principal";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

// Simulated transaction types - replace with actual blockchain types
interface Transaction {
  id: string;
  amount: string; // In ICP
  fromPrincipal: string;
  toPrincipal: string;
  timestamp: number; // Unix timestamp
  status: 'completed' | 'pending' | 'failed';
  isOutgoing: boolean;
}

export function TransactionHistory() {
  const { isConnected, principal, accountId } = useWalletStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && principal) {
      fetchTransactionHistory();
    }
  }, [isConnected, principal]);

  // In a real implementation, this would query the ICP ledger for transactions
  async function fetchTransactionHistory() {
    setIsLoading(true);
    try {
      // Simulated API call - in production, replace with actual ledger query
      // This would use the ic_agent to query the ledger canister
      setTimeout(() => {
        // Mock data for demonstration
        const mockTransactions: Transaction[] = [
          {
            id: "1234567890",
            amount: "0.5",
            fromPrincipal: principal?.toString() || "",
            toPrincipal: "aaaaa-aa",
            timestamp: Date.now() - 3600000, // 1 hour ago
            status: 'completed',
            isOutgoing: true
          },
          {
            id: "9876543210",
            amount: "1.25",
            fromPrincipal: "bbbbb-bb",
            toPrincipal: principal?.toString() || "",
            timestamp: Date.now() - 86400000, // 1 day ago
            status: 'completed',
            isOutgoing: false
          },
          {
            id: "5555555555",
            amount: "0.1",
            fromPrincipal: principal?.toString() || "",
            toPrincipal: "ccccc-cc",
            timestamp: Date.now() - 172800000, // 2 days ago
            status: 'pending',
            isOutgoing: true
          }
        ];
        
        setTransactions(mockTransactions);
        setIsLoading(false);
      }, 1000);
      
      // In production, this would be something like:
      // const ledgerActor = createActor<IcrcLedgerActor>(ICP_LEDGER_CANISTER_ID, icrcLedgerAbi);
      // const txHistory = await ledgerActor.get_transactions({
      //   start: 0,
      //   length: 10,
      //   account: { owner: principal, subaccount: [] }
      // });
      // setTransactions(txHistory);
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setIsLoading(false);
    }
  }

  function formatPrincipalId(principal: string) {
    if (principal === "aaaaa-aa") return "ICP Ledger";
    if (principal.length < 15) return principal;
    return `${principal.substring(0, 5)}...${principal.substring(principal.length - 5)}`;
  }

  if (!isConnected) {
    return (
      <Card className="w-full bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Connect your wallet to view your transaction history
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent transactions from your ICP wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            No transactions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Counter Party</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {tx.isOutgoing ? (
                        <ArrowUp className="h-4 w-4 text-red-500 mr-2" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-green-500 mr-2" />
                      )}
                      {tx.isOutgoing ? "Sent" : "Received"}
                    </div>
                  </TableCell>
                  <TableCell className={tx.isOutgoing ? "text-red-400" : "text-green-400"}>
                    {tx.isOutgoing ? "-" : "+"}{tx.amount} ICP
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">
                    {formatPrincipalId(tx.isOutgoing ? tx.toPrincipal : tx.fromPrincipal)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-zinc-400 text-sm">
                    {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.status === 'completed' 
                        ? 'bg-green-900/20 text-green-400' 
                        : tx.status === 'pending'
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : 'bg-red-900/20 text-red-400'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
