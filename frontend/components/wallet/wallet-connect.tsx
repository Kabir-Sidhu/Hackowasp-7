"use client";

import React, { useEffect, useState } from "react";
import { useWalletStore, WalletType } from "@/lib/stores/wallet-store";
import { 
  connectToInternetIdentity, 
  connectToNFID, 
  connectToPlugWallet,
  principalToAccountIdentifier
} from "@/lib/wallet/wallet-utils";
import "@/lib/wallet/types";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Cpu, Loader2, LogOut } from "lucide-react";
import { motion } from "framer-motion";

// Define canister IDs for the whitelist (add your specific canisters)
const CANISTER_IDS = [
  // Add your backend canister ID and any other canisters you interact with
  // Example: "rrkah-fqaaa-aaaaa-aaaaq-cai", // Backend canister
  // Example: "ryjl3-tyaaa-aaaaa-aaaba-cai", // ICP Ledger canister
];

const MotionButton = motion.create(Button);

export function WalletConnect() {
  const { isConnected, principal, walletType, accountId, actions } = useWalletStore();
  const [isLoading, setIsLoading] = useState<WalletType>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if Plug is installed
  const [isPlugInstalled, setIsPlugInstalled] = useState(false);
  
  useEffect(() => {
    setIsPlugInstalled(Boolean(window?.ic?.plug));
  }, []);
  
  async function handleInternetIdentityLogin() {
    setIsLoading("internetIdentity");
    setError(null);
    try {
      const { principal, identity } = await connectToInternetIdentity();
      const accountId = principalToAccountIdentifier(principal);
      actions.setWallet(principal, "internetIdentity", accountId);
      setShowDialog(false);
    } catch (err: any) {
      setError(err.message || "Failed to connect to Internet Identity");
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  }
  
  async function handleNFIDLogin() {
    setIsLoading("nfid");
    setError(null);
    try {
      // Check if running in a secure context (required for crypto operations)
      if (typeof window !== 'undefined' && 
          (!window.isSecureContext || !window.crypto || !window.crypto.subtle)) {
        throw new Error(
          'Your browser environment does not support the required cryptographic features. ' +
          'Please use a modern browser with SubtleCrypto support.'
        );
      }
      
      // Try connecting with enhanced error handling
      try {
        const { principal, identity } = await connectToNFID();
        const accountId = principalToAccountIdentifier(principal);
        actions.setWallet(principal, "nfid", accountId);
        setShowDialog(false);
      } catch (nfidError: any) {
        // Handle specific NFID errors
        if (nfidError.message?.includes('SubtleCrypto')) {
          throw new Error(
            'Cryptography support is not available. This may be due to running in an insecure context. ' +
            'Try using a different browser or accessing the site via HTTPS.'
          );
        }
        throw nfidError; // Re-throw other errors
      }
    } catch (err: any) {
      // For demo purposes in development, generate mock data instead
      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        try {
          console.warn('Using mock NFID login for development');
          // Generate a mock principal and account ID
          const mockPrincipal = await import('@dfinity/principal')
            .then(module => module.Principal.fromText("2vxsx-fae"));
          const mockAccountId = principalToAccountIdentifier(mockPrincipal);
          actions.setWallet(mockPrincipal, "nfid", mockAccountId);
          setShowDialog(false);
          return;
        } catch (mockError) {
          console.error('Failed to create mock wallet data:', mockError);
        }
      }
      
      setError(err.message || "Failed to connect to NFID");
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  }
  
  async function handlePlugLogin() {
    setIsLoading("plug");
    setError(null);
    try {
      // Safety wrapper for browser environment
      if (typeof window === 'undefined' || !window.ic?.plug) {
        throw new Error('Plug wallet is not available');
      }

      // Check if running in an iframe, which can cause extension messaging issues
      if (window !== window.top) {
        throw new Error('Plug wallet cannot be used in an iframe. Please open in a new tab.');
      }

      try {
        const { principal, accountId } = await connectToPlugWallet(CANISTER_IDS);
        actions.setWallet(principal, "plug", accountId);
        setShowDialog(false);
      } catch (plugError) {
        // If we get an extension messaging error, provide a more helpful message
        if (plugError.message?.includes('chrome.runtime.sendMessage()') || 
            plugError.message?.includes('Extension ID')) {
          throw new Error('Please open Plug wallet extension first and try again');
        }
        throw plugError;
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to Plug Wallet");
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  }
  
  function handleDisconnect() {
    actions.disconnect();
  }
  
  function handleOpenDialog() {
    setShowDialog(true);
    setError(null);
  }
  
  return (
    <>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="hidden md:block text-sm text-zinc-400">
            {/* {walletType === "internetIdentity" && "Internet Identity"} */}
            {walletType === "nfid" && "NFID"}
            {walletType === "plug" && "Plug"}
            : {principal?.toString().slice(0, 5)}...{principal?.toString().slice(-3)}
          </span>
          <MotionButton
            size="sm"
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-950"
            onClick={handleDisconnect}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(220, 38, 38, 0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Disconnect
          </MotionButton>
        </div>
      ) : (
        <MotionButton
          onClick={handleOpenDialog}
          className="bg-purple-600 hover:bg-purple-700"
          whileHover={{ scale: 1.05, backgroundColor: "#7e22ce" }}
          whileTap={{ scale: 0.95 }}
        >
          Connect Wallet
        </MotionButton>
      )}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Connect to GPULend</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-3">
              {/* <MotionButton
                disabled={isLoading !== null}
                onClick={handleInternetIdentityLogin}
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800 flex items-center justify-center h-12"
                whileHover={{ scale: 1.02, borderColor: "#9333ea" }}
              >
                {/* {isLoading === "internetIdentity" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  // <>
                  //   <img src="https://internetcomputer.org/img/IC_logo_horizontal.svg" 
                  //        alt="Internet Identity" 
                  //        className="h-5 mr-2" />
                  //   Internet Identity
                  // </>
                )} 
              </MotionButton> */}
              
              <MotionButton
                disabled={isLoading !== null}
                onClick={handleNFIDLogin}
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800 flex items-center justify-center h-12"
                whileHover={{ scale: 1.02, borderColor: "#9333ea" }}
              >
                {isLoading === "nfid" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <img src="https://user-images.githubusercontent.com/33829677/162224559-f38581ec-fbd7-4ab0-a99a-5bf5332811b3.png" 
                         alt="NFID" 
                         className="h-5 mr-2" />
                    NFID
                  </>
                )}
              </MotionButton>
              
              <MotionButton
                disabled={isLoading !== null || !isPlugInstalled}
                onClick={handlePlugLogin}
                variant="outline"
                className={`border-zinc-700 hover:bg-zinc-800 flex items-center justify-center h-12 ${
                  !isPlugInstalled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={isPlugInstalled ? { scale: 1.02, borderColor: "#9333ea" } : {}}
              >
                {isLoading === "plug" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <img src="https://play-lh.googleusercontent.com/C1Aw_QnECyezACj9zmSz0vxrszP5LoiPA9K1zwiGn8PxsxyQSMmCLA7IZwFBQEbwF5dQ=w480-h960" 
                         alt="Plug Wallet" 
                         className="h-5 mr-2" />
                    {isPlugInstalled ? "Plug Wallet" : "Plug Not Installed"}
                  </>
                )}
              </MotionButton>
            </div>
            
            {!isPlugInstalled && (
              <div className="text-xs text-zinc-500 text-center">
                <a 
                  href="https://plugwallet.ooo/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-purple-500 hover:text-purple-400"
                >
                  Install Plug Wallet
                </a> to access additional features.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
