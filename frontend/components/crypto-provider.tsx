"use client";

import { useEffect } from "react";
// Import our safer crypto polyfill helpers
import { getCrypto, getSubtleCrypto } from "@/lib/wallet/crypto-polyfill";

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if crypto and subtle are available after our polyfill has run
    const cryptoObj = getCrypto();
    const subtleObj = getSubtleCrypto();
    
    if (!cryptoObj || !subtleObj) {
      console.warn('SubtleCrypto not fully available in this browser environment');
      console.info('Some crypto-dependent features like wallet connections may not work properly');
    }
  }, []);

  return <>{children}</>;
}
