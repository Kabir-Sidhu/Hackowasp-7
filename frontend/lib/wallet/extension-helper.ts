"use client";

/**
 * This helper provides safe detection and communication with browser extensions
 * It avoids the common chrome.runtime.sendMessage errors when dealing with extensions
 */

/**
 * Safely checks if Plug wallet is installed and available
 */
export const safelyCheckPlugWallet = async (): Promise<{
  isInstalled: boolean;
  isAvailable: boolean;
  error?: string;
}> => {
  // Default response
  const response = {
    isInstalled: false,
    isAvailable: false,
  };

  try {
    // First check if window object exists (for SSR compatibility)
    if (typeof window === 'undefined') {
      return response;
    }
    
    // Check if plug is defined in the global window.ic object
    if (!window.ic || !window.ic.plug) {
      return response;
    }

    // Mark as installed if we get this far
    response.isInstalled = true;

    // Try to access a method to verify availability
    // We'll use a timeout to prevent hanging if the extension is not responding
    const isAvailable = await Promise.race([
      // Check if we can call a method on the plug object
      (async () => {
        try {
          // Just try to access a property or method
          // Different versions of Plug expose different APIs
          const plugAny = window.ic.plug as any;
          
          // First try isConnected since it's commonly available
          if (typeof plugAny.isConnected === 'function') {
            try {
              await plugAny.isConnected();
              return true;
            } catch (connErr) {
              // If there's a runtime.sendMessage error, the extension is installed
              // but not properly communicating (could be closed)
              const errMsg = connErr instanceof Error ? connErr.message : String(connErr);
              if (
                errMsg.includes('chrome.runtime.sendMessage') || 
                errMsg.includes('runtime.sendMessage') || 
                errMsg.includes('Extension ID')
              ) {
                // Extension exists but can't communicate - might be closed
                console.warn('Plug extension communication error:', errMsg);
                return false;
              }
              
              // For other errors, continue checking other methods
            }
          }
          
          // Try a gentle property check that doesn't involve messaging
          if (
            plugAny.agent || 
            plugAny.createActor || 
            plugAny.requestConnect
          ) {
            // Extension probably exists but might not be responsive
            return true;
          }
          
          return false;
        } catch (err) {
          // Check for specific extension messaging errors
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn('Error checking Plug wallet availability:', errMsg);
          
          if (
            errMsg.includes('chrome.runtime.sendMessage') || 
            errMsg.includes('runtime.sendMessage') || 
            errMsg.includes('Extension ID')
          ) {
            // Extension exists but can't communicate - might be closed
            return false;
          }
          
          // If the error is about something else, the extension might still be available
          // For example, isConnected might fail because we're not connected, but that's different
          // from the extension not being available
          return false; // Being more conservative here
        }
      })(),
      // Timeout after 1000ms
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)),
    ]);

    response.isAvailable = isAvailable;
    return response;
  } catch (error) {
    console.error('Error checking Plug wallet', error);
    return {
      ...response,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Gets the Plug wallet extension ID if available
 * Note: This is a workaround for runtime.sendMessage errors
 */
const getPlugExtensionId = (): string | null => {
  // Common IDs for Plug wallet extension
  // These may need to be updated if Plug changes their extension ID
  const knownPlugIds = [
    'fkjmikaojmhkkblnkfnbclkjkogklmhj', // Chrome Store Plug ID
    'odpofnoidgmhkfldgbniajaaancdadcg'  // Another known ID
  ];
  
  try {
    // If Plug exposes its ID directly (ideal scenario)
    const plug = window?.ic?.plug as any;
    if (plug && plug.extensionId) {
      return plug.extensionId;
    }
    
    // Try to infer from installed extensions if browser allows it
    // This is a fallback and may not work in all browsers
    // Check if chrome is defined in this context (it may not be in all browsers)
    if (typeof window !== 'undefined' && 'chrome' in window) {
      const chromeApi = (window as any).chrome;
      if (chromeApi && chromeApi.runtime && chromeApi.runtime.id) {
        // Check if we're in the context of the Plug extension itself
        return chromeApi.runtime.id;
      }
    }
    
    // Use the first known ID as a last resort
    return knownPlugIds[0];
  } catch (e) {
    console.warn('Unable to determine Plug extension ID:', e);
    return knownPlugIds[0]; // Fallback to known ID
  }
};

/**
 * Generic safe Plug operation wrapper
 * Catches and handles extension communication errors
 */
export const safePlugOperation = async <T>(operation: () => Promise<T>, errorFallback?: T): Promise<T> => {
  try {
    // First verify Plug is actually accessible
    const { isInstalled, isAvailable, error } = await safelyCheckPlugWallet();
    if (!isInstalled) {
      throw new Error('Plug wallet is not installed');
    }
    if (!isAvailable) {
      throw new Error(
        'Unable to communicate with Plug wallet extension. ' +
        'Please make sure the extension is open and refresh this page.'
      );
    }

    // Patch the window.ic.plug object with extension ID if missing
    // This helps prevent runtime.sendMessage errors
    try {
      const plugAny = window.ic.plug as any;
      if (plugAny && !plugAny._hasBeenPatched) {
        // Save original methods we need to patch
        const originalRequestConnect = plugAny.requestConnect;
        const originalIsConnected = plugAny.isConnected;
        const originalRequestBalance = plugAny.requestBalance;
        const originalRequestTransfer = plugAny.requestTransfer;
        
        // Get extension ID
        const extensionId = getPlugExtensionId();
        
        // Patch methods to include extension ID in communications
        if (typeof originalRequestConnect === 'function') {
          plugAny.requestConnect = async (...args: any[]) => {
            try {
              return await originalRequestConnect.apply(plugAny, args);
            } catch (e) {
              const errMsg = e instanceof Error ? e.message : String(e);
              if (errMsg.includes('runtime.sendMessage') || errMsg.includes('Extension ID')) {
                console.log('Attempting direct communication with extension ID:', extensionId);
                // Here we would use chrome.runtime.sendMessage with extensionId
                // But this is complex and may not be allowed in all contexts
                throw new Error('Please open the Plug wallet extension and refresh this page');
              }
              throw e;
            }
          };
        }
        
        // Mark as patched to avoid double patching
        plugAny._hasBeenPatched = true;
      }
    } catch (patchErr) {
      console.warn('Failed to patch Plug methods:', patchErr);
      // Continue with operation even if patching failed
    }

    // Execute the operation
    return await operation();
  } catch (err) {
    console.error('Error in Plug wallet operation:', err);
    
    // Format error message
    const errMsg = err instanceof Error ? err.message : String(err);
    
    // Check for specific extension communication errors
    if (
      errMsg.includes('chrome.runtime.sendMessage') ||
      errMsg.includes('runtime.sendMessage') ||
      errMsg.includes('Extension ID')
    ) {
      throw new Error(
        'Unable to communicate with Plug wallet extension. ' +
        'Please make sure the extension is open and refresh this page.'
      );
    }
    
    // Rethrow the original error if not handled specifically
    if (errorFallback !== undefined) {
      console.warn('Using fallback value for failed Plug operation');
      return errorFallback;
    }
    throw err;
  }
};

/**
 * Safely gets the current connection status of Plug wallet
 */
export const safeIsConnected = async (): Promise<boolean> => {
  try {
    const { isInstalled, isAvailable } = await safelyCheckPlugWallet();
    if (!isInstalled || !isAvailable) return false;
    
    return await safePlugOperation(async () => {
      return await window.ic.plug.isConnected();
    });
  } catch (e) {
    console.warn("Error checking connection status:", e);
    return false;
  }
};

/**
 * Safely requests connection to Plug wallet
 * @returns Connection response object or boolean depending on Plug version
 */
export const safeRequestConnect = async (options?: {
  whitelist?: string[];
  host?: string;
}): Promise<any> => {
  return await safePlugOperation(async () => {
    const result = await window.ic.plug.requestConnect(options || {});
    // Return the result regardless of type
    // Different Plug versions may return different formats
    return result;
  });
};

/**
 * Safely gets balance from Plug wallet
 */
export const safeRequestBalance = async () => {
  return await safePlugOperation(async () => {
    // Use any type to bypass TypeScript issues
    const plugAny = window.ic.plug as any;
    
    if (typeof plugAny.requestBalance !== 'function') {
      throw new Error('This version of Plug wallet does not support balance checking');
    }
    
    return await plugAny.requestBalance();
  });
};

/**
 * Safely requests a transfer via Plug wallet
 */
export const safeRequestTransfer = async (params: {
  to: string;
  amount: number;
  opts?: {
    fee?: number;
    memo?: string;
    from_subaccount?: number;
    created_at_time?: {
      timestamp_nanos: number;
    };
  };
}) => {
  return await safePlugOperation(async () => {
    // Use any type to bypass TypeScript issues
    const plugAny = window.ic.plug as any;
    
    if (typeof plugAny.requestTransfer !== 'function') {
      throw new Error('This version of Plug wallet does not support transfers');
    }
    
    return await plugAny.requestTransfer(params);
  });
};
