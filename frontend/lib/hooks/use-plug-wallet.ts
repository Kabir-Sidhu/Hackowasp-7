"use client";

import { useEffect, useState, useCallback } from 'react';
import { Principal } from '@dfinity/principal';
import { useWalletStore } from '@/lib/stores/wallet-store';
import { principalToAccountIdentifier } from '@/lib/wallet/wallet-utils';
import {
  safelyCheckPlugWallet,
  safeRequestConnect,
  safeIsConnected
} from '@/lib/wallet/extension-helper';

// Default ICP Ledger canister ID - required for token operations
const ICP_LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";

// Define all the canisters your app needs to interact with
export const DEFAULT_CANISTER_IDS = [
  ICP_LEDGER_CANISTER_ID,
  // Add your backend canister IDs here
  // Example: "rrkah-fqaaa-aaaaa-aaaaq-cai", // Backend canister
];

// Define network hosts
const IC_HOST = "https://icp0.io";
const LOCAL_HOST = "http://localhost:8000";

export interface UsePlugWalletOptions {
  canisterIds?: string[];
  host?: string;
  timeout?: number;
  autoConnect?: boolean;
  onDisconnect?: () => void;
  onLockChange?: (isLocked: boolean) => void;
}

export function usePlugWallet(options: UsePlugWalletOptions = {}) {
  const {
    canisterIds = DEFAULT_CANISTER_IDS,
    host = process.env.NODE_ENV === 'production' ? IC_HOST : LOCAL_HOST,
    timeout = 60000,
    autoConnect = true,
    onDisconnect,
    onLockChange
  } = options;

  const { isConnected, principal, walletType, accountId, actions } = useWalletStore();
  const [isPlugInstalled, setIsPlugInstalled] = useState<boolean | null>(null);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Plug is installed
  useEffect(() => {
    setIsPlugInstalled(Boolean(window?.ic?.plug));
  }, []);

  // Set up Plug callbacks for wallet events
  useEffect(() => {
    // Don't proceed if Plug is not installed
    if (!window?.ic?.plug) return;

    // Note: These callback methods may not be available in all versions of Plug
    // Using type safety checks before accessing them
    
    // Handle external disconnect (user disconnects via extension UI)
    const plugAny = window.ic.plug as any; // Use any to bypass strict typing
    
    if (plugAny && typeof plugAny.onExternalDisconnect === 'function') {
      try {
        plugAny.onExternalDisconnect(() => {
          console.log('Plug wallet disconnected externally');
          actions.disconnect();
          if (onDisconnect) onDisconnect();
        });
      } catch (e) {
        console.warn('onExternalDisconnect is not supported in this version of Plug');
      }
    }

    // Handle wallet lock state changes
    if (plugAny && typeof plugAny.onLockStateChange === 'function') {
      try {
        plugAny.onLockStateChange((locked: boolean) => {
          console.log(`Plug wallet ${locked ? 'locked' : 'unlocked'}`);
          setIsLocked(locked);
          if (onLockChange) onLockChange(locked);
        });
      } catch (e) {
        console.warn('onLockStateChange is not supported in this version of Plug');
      }
    }

    // Cleanup callbacks on unmount (not actually needed since these are singleton registrations)
    return () => {
      // No cleanup needed as Plug doesn't provide a way to remove listeners
    };
  }, [actions, onDisconnect, onLockChange]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && isPlugInstalled && !isConnected && walletType !== 'plug') {
      checkConnection();
    }
  }, [autoConnect, isPlugInstalled, isConnected, walletType]);

  // Check if already connected to Plug
  const checkConnection = useCallback(async () => {
    // Use our safe extension helper to check connection
    try {
      // First check if wallet is available and installed
      const { isInstalled, isAvailable } = await safelyCheckPlugWallet();
      if (!isInstalled || !isAvailable) return false;
      
      // Now check if connected
      const connected = await safeIsConnected();
      
      // If already connected, get principal and account info
      if (connected && walletType !== 'plug') {
        try {
          // Get principal with defensive checks to avoid errors
          const plugAny = window.ic.plug as any;
          let principal;
          
          // Safely access agent and getPrincipal
          if (plugAny.agent && typeof plugAny.agent.getPrincipal === 'function') {
            principal = await plugAny.agent.getPrincipal();
          } else {
            console.warn('Principal could not be retrieved from Plug wallet');
            return connected;
          }
          
          // Get account ID using the appropriate method
          let accountId;
          if (typeof plugAny.getAccountId === 'function') {
            accountId = await plugAny.getAccountId();
          } else if (plugAny.accountId) {
            // Access as a property, not a function
            accountId = plugAny.accountId;
          } else {
            // Fallback: derive account ID from principal
            accountId = principalToAccountIdentifier(principal);
          }
          
          // Update wallet store
          actions.setWallet(principal, 'plug', accountId);
        } catch (innerErr) {
          console.error('Error retrieving Plug wallet details:', innerErr);
          // Still return connected status even if we couldn't get all the details
          return connected;
        }
      }
      
      return connected;
    } catch (err) {
      console.error('Error checking Plug connection:', err);
      return false;
    }
  }, [actions, walletType]);

  // Connect to Plug wallet
  const connect = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      // First check if the wallet is properly installed and available
      const { isInstalled, isAvailable, error } = await safelyCheckPlugWallet();
      
      if (!isInstalled) {
        setError('Plug wallet is not installed. Please install the Plug wallet extension.');
        return false;
      }
      
      if (!isAvailable) {
        setError('Cannot communicate with Plug wallet. Please make sure the extension is open and then refresh this page.');
        return false;
      }
      
      // Check if already connected
      const isAlreadyConnected = await checkConnection();
      if (isAlreadyConnected) return true;

      // Prepare connection options
      const requestOptions: any = {
        whitelist: canisterIds,
        host
      };
      
      // Only add timeout if it's provided and not undefined
      if (timeout !== undefined) {
        requestOptions.timeout = timeout;
      }
      
      // Use safe request connect to avoid runtime errors
      try {
        // Use our extension helper for safe communication
        const result = await safeRequestConnect(requestOptions);
        
        // Handle different return formats from different Plug versions
        const connected = typeof result === 'boolean' ? result : true;
        
        if (!connected) {
          setError('User rejected the connection request');
          return false;
        }
        
        // Refresh connection info after successful connection
        await checkConnection();
        return true;
      } catch (connectErr) {
        const errMsg = connectErr instanceof Error ? connectErr.message : String(connectErr);
        
        if (errMsg.includes('User rejected')) {
          setError('Connection was rejected. Please try again and approve the connection request in Plug wallet.');
        } else if (errMsg.includes('Already connected')) {
          return true;
        } else {
          setError(errMsg);
        }
        
        return false;
      }
    } catch (err) {
      console.error('Error connecting to Plug wallet:', err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [actions, canisterIds, host, timeout, checkConnection]);

  // Disconnect from Plug wallet
  const disconnect = useCallback(async (): Promise<void> => {
    if (!window?.ic?.plug) return;
    
    try {
      // Call Plug's disconnect method if available
      if (typeof window.ic.plug.disconnect === 'function') {
        await window.ic.plug.disconnect();
      }
      
      // Update our state
      actions.disconnect();
    } catch (err) {
      console.error('Error disconnecting from Plug wallet:', err);
    }
  }, [actions]);

  // Get current principal information
  const getPlugPrincipal = useCallback(async (): Promise<Principal | null> => {
    if (!window?.ic?.plug || !isConnected) return null;
    
    try {
      return await window.ic.plug.agent.getPrincipal();
    } catch (err) {
      console.error('Error getting Plug principal:', err);
      return null;
    }
  }, [isConnected]);

  // Verify the connection with the requested canisters
  const verifyConnection = useCallback(async (specificCanisterIds?: string[]): Promise<boolean> => {
    try {
      // Check if wallet is available using our safe helper
      const { isInstalled, isAvailable } = await safelyCheckPlugWallet();
      if (!isInstalled || !isAvailable) return false;
      
      // Check connection status safely
      const connected = await safeIsConnected();
      if (!connected) {
        return await connect();
      }
      
      // If specific canister IDs were provided, ensure they are whitelisted
      if (specificCanisterIds && specificCanisterIds.length > 0) {
        // Create request options without timeout if not supported
        const requestOptions: any = {
          whitelist: specificCanisterIds,
          host
        };
        
        // Only add timeout if it's provided and not undefined
        if (timeout !== undefined) {
          requestOptions.timeout = timeout;
        }
        
        // Use safe request connect to avoid runtime errors
        try {
          await safeRequestConnect(requestOptions);
          return true;
        } catch (connectErr) {
          console.error('Error updating canister whitelist:', connectErr);
          return false;
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error verifying Plug connection:', err);
      return false;
    }
  }, [connect, host, timeout]);

  return {
    isPlugInstalled,
    isConnected: isConnected && walletType === 'plug',
    isConnecting,
    isLocked,
    principal: isConnected && walletType === 'plug' ? principal : null,
    accountId: isConnected && walletType === 'plug' ? accountId : null,
    error,
    connect,
    disconnect,
    verifyConnection,
    getPlugPrincipal
  };
}
