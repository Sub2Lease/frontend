import { useLeaseActions } from "@/hooks/useLeaseActions";
import { API_BASE } from "@/constants";

export const useActivateSmartPayments = () => {
  const { createLease } = useLeaseActions();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activate = async (agreement: any) => {
    console.log("DEBUG AGREEMENT:", agreement);

    if (!agreement._id) throw new Error("Agreement missing _id");

    // SAFE leaseId from Mongo
    const leaseId = BigInt("0x" + agreement._id.substring(0, 16));

    const rentWei = BigInt(agreement.rent);
    const depositWei = BigInt(agreement.securityDeposit);

    const tenantUser = await fetch(
      `${API_BASE}/users?userId=${agreement.tenant}`
    ).then((r) => r.json());

    const tenantWallet = tenantUser[0].walletAddress as `0x${string}`;

    const startUnix = Math.floor(
      new Date(agreement.startDate).getTime() / 1000
    );

    await createLease(
      leaseId,
      tenantWallet,
      rentWei,
      depositWei,
      BigInt(startUnix)
    );
  };

  return { activate };
};
