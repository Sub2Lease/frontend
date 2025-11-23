import { useReadContract } from "wagmi";
import { leaseAbi, LEASE_CONTRACT } from "@/contracts/leaseAbi";
import { useMemo } from "react";

export interface LeaseStruct {
  leaseId: bigint;
  tennant: `0x${string}`;
  subletter: `0x${string}`;
  startDate: bigint;
  paymentTimestamps: bigint[];
  monthlyRent: bigint;
  rentAvailableToWithdraw: bigint;
  securityDeposit: bigint;
  depositHeld: bigint;
  isActive: boolean;
}

export interface PaymentItem {
  id: string;
  leaseId: number;
  date: string;
  amount: string;
  property: string;
  status: string;
}

const TEST_TENANT = "0xafC65d5831682d1bD4998F1aA798d8e60B9afd00";
// const TEST_TENANT = "0x954f16fcc97b41330adc085723d869cf823fcf1b";

export const useLeasePayments = () => {
  const { data, isLoading, refetch } = useReadContract({
    address: LEASE_CONTRACT,
    abi: leaseAbi,
    functionName: "getLeasesByTennant",
    args: [TEST_TENANT],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leases = (Array.isArray(data) ? data : []) as LeaseStruct[];

  const payments = useMemo<PaymentItem[]>(() => {
    return leases.flatMap((lease) =>
      lease.paymentTimestamps.map((ts, idx) => ({
        id: `${lease.leaseId}-${idx}`,
        leaseId: Number(lease.leaseId),
        date: new Date(Number(ts) * 1000).toLocaleDateString(),
        amount: lease.monthlyRent.toString(),
        property: `Lease #${lease.leaseId}`,
        status: lease.isActive ? "Lease Active" : "Lease Ended",
      }))
    );
  }, [leases]);

  return { leases, payments, isLoading, refetch };
};
