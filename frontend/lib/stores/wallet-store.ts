import { create } from 'zustand';
import { Principal } from '@dfinity/principal';

export type WalletType = 'internetIdentity' | 'nfid' | 'plug' | null;

interface WalletState {
  isConnected: boolean;
  principal: Principal | null;
  walletType: WalletType;
  accountId: string | null;
  actions: {
    setWallet: (principal: Principal, walletType: WalletType, accountId: string | null) => void;
    disconnect: () => void;
  };
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  principal: null,
  walletType: null,
  accountId: null,
  actions: {
    setWallet: (principal, walletType, accountId) => 
      set({ isConnected: true, principal, walletType, accountId }),
    disconnect: () => 
      set({ isConnected: false, principal: null, walletType: null, accountId: null }),
  },
}));
