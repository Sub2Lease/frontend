import { useAccount } from "wagmi";
import { useEffect } from "react";
import { LOCAL_STORAGE_USER_KEY, API_BASE } from "@/constants";

export const useSyncWallet = () => {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !address) return;

    // get current user from local storage
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return;

    const user = JSON.parse(raw);

    fetch(`${API_BASE}/users/${user._id}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address })
    });
  }, [address, isConnected]);
};
