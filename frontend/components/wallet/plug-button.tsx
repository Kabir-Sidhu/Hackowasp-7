"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePlugWallet } from "@/lib/hooks/use-plug-wallet";
import { toast } from "@/components/ui/use-toast";

const MotionButton = motion.create(Button);

interface PlugButtonProps {
  canisterIds?: string[];
  host?: string;
  onConnect?: (principal: string, accountId: string) => void;
  onDisconnect?: () => void;
  showAccountInfo?: boolean;
  buttonText?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
}

export function PlugButton({
  canisterIds,
  host,
  onConnect,
  onDisconnect,
  showAccountInfo = false,
  buttonText = "Connect with Plug",
  className = "",
  variant = "default"
}: PlugButtonProps) {
  const {
    isPlugInstalled,
    isConnected,
    isConnecting,
    principal,
    accountId,
    error,
    connect,
    disconnect
  } = usePlugWallet({
    canisterIds,
    host,
    autoConnect: true,
    onDisconnect,
    onLockChange: (isLocked) => {
      if (isLocked) {
        toast({
          title: "Wallet Locked",
          description: "Your Plug wallet is locked. Please unlock it to continue.",
          variant: "default"
        });
      }
    }
  });
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  useEffect(() => {
    if (isConnected && principal && accountId && onConnect) {
      onConnect(principal.toString(), accountId);
    }
  }, [isConnected, principal, accountId, onConnect]);

  const handleConnect = async () => {
    if (!isPlugInstalled) {
      window.open("https://plugwallet.ooo/", "_blank");
      return;
    }
    
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied to clipboard",
      duration: 2000
    });
  };

  // Format principal or account ID for display
  const formatId = (id: string) => {
    if (!id) return "";
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  if (!isPlugInstalled) {
    return (
      <MotionButton
        className={`flex items-center justify-center gap-2 ${className}`}
        variant={variant}
        onClick={handleConnect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <img 
          src="https://docs.plugwallet.ooo/imgs/plug-logo.svg" 
          alt="Plug Wallet" 
          className="h-5 w-5" 
        />
        Install Plug Wallet
      </MotionButton>
    );
  }

  if (isConnected && principal) {
    return (
      <div className="flex flex-col">
        <MotionButton
          className={`flex items-center justify-center gap-2 ${className}`}
          variant={variant}
          onClick={handleDisconnect}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img 
            src="https://docs.plugwallet.ooo/imgs/plug-logo.svg" 
            alt="Plug Wallet" 
            className="h-5 w-5" 
          />
          Disconnect Plug
        </MotionButton>
        
        {showAccountInfo && accountId && (
          <div className="mt-2 text-xs text-zinc-400">
            <div 
              className="cursor-pointer hover:text-zinc-300 transition-colors" 
              onClick={() => copyToClipboard(principal.toString())}
            >
              Principal: {formatId(principal.toString())}
            </div>
            <div 
              className="cursor-pointer hover:text-zinc-300 transition-colors"
              onClick={() => copyToClipboard(accountId)}
            >
              Account ID: {formatId(accountId)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <MotionButton
      className={`flex items-center justify-center gap-2 ${className}`}
      variant={variant}
      onClick={handleConnect}
      disabled={isConnecting}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isConnecting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <img 
          src="https://docs.plugwallet.ooo/imgs/plug-logo.svg" 
          alt="Plug Wallet" 
          className="h-5 w-5" 
        />
      )}
      {buttonText}
    </MotionButton>
  );
}
