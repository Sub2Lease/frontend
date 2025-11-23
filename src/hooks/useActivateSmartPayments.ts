import { useLeaseActions } from "@/hooks/useLeaseActions";
import { keccak256, toHex } from "viem";
import { API_BASE } from "@/constants";

export const useActivateSmartPayments = () => {
  const { createLease } = useLeaseActions();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activate = async (agreement: any) => {
    console.log("DEBUG AGREEMENT:", agreement);

    // Validate required fields
    if (!agreement.id) throw new Error("Agreement missing id");
    if (agreement.rent === undefined) throw new Error("Agreement missing rent");
    if (agreement.securityDeposit === undefined) throw new Error("Agreement missing securityDeposit");
    if (!agreement.startDate) throw new Error("Agreement missing startDate");
    if (!agreement.tenant) throw new Error("Agreement missing tenant userId");

    // 1) Convert UUID/string id → uint256
    const leaseId = BigInt(keccak256(toHex(agreement.id)));

    // 2) Treat rent/securityDeposit as WEI
    const rentWei = BigInt(agreement.rent);
    const depositWei = BigInt(agreement.securityDeposit);

    // 3) Fetch tenant from backend to get walletAddress
    const tenantUser = await fetch(`${API_BASE}/users?userId=${agreement.tenant}`)
  .then((r) => r.json());

    if (!tenantUser[0].walletAddress) {
      throw new Error("Tenant has no walletAddress stored.");
    }

    const tenantWallet = tenantUser.walletAddress as `0x${string}`;

    // 4) Convert startDate → unix seconds
    const startUnix = Math.floor(new Date(agreement.startDate).getTime() / 1000);
    const start = BigInt(startUnix);

    // 5) Call the smart contract
    await createLease(
      leaseId,
      tenantWallet,
      rentWei,
      depositWei,
      start
    );
  };

  return { activate };
};
