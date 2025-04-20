// Module declarations for packages without official type definitions
declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

// UI component library declarations
declare module 'react-day-picker' {
  export * from 'react-day-picker';
}

declare module '@radix-ui/react-slider' {
  export * from '@radix-ui/react-slider';
}

declare module '@radix-ui/react-tabs' {
  export * from '@radix-ui/react-tabs';
}

declare module '@radix-ui/react-dialog' {
  export * from '@radix-ui/react-dialog';
}

declare module 'recharts' {
  export * from 'recharts';
}

declare module 'cmdk' {
  export * from 'cmdk';
}

declare module '@radix-ui/react-checkbox' {
  export * from '@radix-ui/react-checkbox';
}

declare module 'vaul' {
  export * from 'vaul';
}

declare module 'react-resizable-panels' {
  export * from 'react-resizable-panels';
}

declare module '@radix-ui/react-toast' {
  export * from '@radix-ui/react-toast';
}

declare module 'sonner' {
  export * from 'sonner';
}

// Add global window interface extensions for Plug Wallet
interface Window {
  ic?: {
    plug?: {
      agent?: any;
      createActor?: any;
      requestConnect?: (options?: {
        whitelist?: string[];
        host?: string;
      }) => Promise<{
        publicKey: string;
        accountId: string;
        principalId: string;
      }>;
      isConnected?: () => Promise<boolean>;
      disconnect?: () => Promise<void>;
      getPrincipal?: () => Promise<any>;
      getAccountId?: () => Promise<string>;
      accountId?: () => Promise<string>; // Adding missing accountId method
    };
  };
}

// Add JSX namespace to fix "JSX element implicitly has type 'any'" errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
