//after syncing wallet use it

import { useSyncWallet } from "@/hooks/useSyncWallet";

export const AppWalletSync = () => {
  useSyncWallet();
  return null;
};