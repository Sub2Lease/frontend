// src/hooks/useLeasePaymentsOwner.ts
import { useReadContract, useAccount } from "wagmi";
import { leaseAbi, LEASE_CONTRACT } from "@/contracts/leaseAbi";

export const useLeasePaymentsOwner = () => {
  const address = useAccount().address;

  const { data, isLoading, refetch } = useReadContract({
    address: LEASE_CONTRACT,
    abi: leaseAbi,
    functionName: "getLeasesByLandOwner",
    args: [address],
  });

  const leases = Array.isArray(data) ? data : [];

  return { leases, isLoading, refetch };
};
