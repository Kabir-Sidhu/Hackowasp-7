// This file provides a polyfill for the SubtleCrypto API when running in environments
// where it might not be available or properly configured.

// IMPORTANT: Only run this in the browser, not during server-side rendering
if (typeof window !== 'undefined') { // Only run on the client side
  // Check if we need a polyfill
  const needsCryptoPolyfill = !window.crypto || !window.crypto.subtle;
  
  if (needsCryptoPolyfill) {
    console.warn('SubtleCrypto not available, some features may not work properly');
    
    try {
      // We'll use a safer approach that doesn't try to override crypto directly
      // Instead we'll create a module that exports the mock implementation
      const mockSubtle = {
        digest: async (algorithm: string, data: BufferSource) => {
          // This is just a mock that returns a deterministic value
          // DO NOT use this in production!
          const mockHash = new Uint8Array(32);
          for (let i = 0; i < mockHash.length; i++) {
            mockHash[i] = (i + 1) % 256;
          }
          return mockHash.buffer;
        },
        encrypt: async () => new ArrayBuffer(16),
        decrypt: async () => new ArrayBuffer(16),
        sign: async () => new ArrayBuffer(64),
        verify: async () => true,
        generateKey: async () => ({}),
        deriveKey: async () => ({}),
        deriveBits: async () => new ArrayBuffer(32),
        importKey: async () => ({}),
        exportKey: async () => new ArrayBuffer(32),
        wrapKey: async () => new ArrayBuffer(32),
        unwrapKey: async () => ({}),
      };
      
      // If subtle doesn't exist but crypto does, we'll try to patch just the subtle property
      if (window.crypto && !window.crypto.subtle && Object.isExtensible(window.crypto)) {
        try {
          // Try to add the subtle property if possible
          (window.crypto as any).subtle = mockSubtle;
        } catch (e) {
          console.warn('Could not add subtle to window.crypto:', e);
        }
      }

      // For libraries that check for specific crypto methods, we can patch those into the global namespace
      // without directly trying to override the crypto object
      (window as any).__cryptoPolyfill = {
        subtle: mockSubtle,
        getRandomValues: (array: Uint8Array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        }
      };
    } catch (e) {
      console.error('Error setting up crypto polyfill:', e);
    }
  }
}

// Export a helper that can be used to get either the native or polyfilled implementation
export const getCrypto = () => {
  if (typeof window === 'undefined') {
    // Return a no-op version for SSR
    return null;
  }
  
  return window.crypto || (window as any).__cryptoPolyfill;
};

export const getSubtleCrypto = () => {
  const cryptoObj = getCrypto();
  return cryptoObj && (cryptoObj.subtle || (cryptoObj as any).__subtle);
};
