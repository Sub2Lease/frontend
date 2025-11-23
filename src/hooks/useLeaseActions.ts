import { useAccount, useWriteContract } from "wagmi";
import { leaseAbi, LEASE_CONTRACT } from "@/contracts/leaseAbi";

export const useLeaseActions = () => {
  const { address, chainId } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  if (!address) {
    console.warn("Wallet not connected");
  }

  // ------------------------
  // PAY SECURITY DEPOSIT
  // ------------------------
  const payDeposit = (leaseId: number, amountWei: string) => {
    writeContract({
      abi: leaseAbi,
      address: LEASE_CONTRACT,
      functionName: "fundSecurityDeposit",
      args: [BigInt(leaseId)],
      value: BigInt(amountWei),
      account: address,
      chainId,
      chain: undefined,   // REQUIRED
    });
  };

  // ------------------------
  // PAY RENT
  // ------------------------
  const payRent = (leaseId: number, amountWei: string) => {
    writeContract({
      abi: leaseAbi,
      address: LEASE_CONTRACT,
      functionName: "depositRent",
      args: [BigInt(leaseId)],
      value: BigInt(amountWei),
      account: address,
      chainId,
      chain: undefined,   // REQUIRED
    });
  };

  // ------------------------
  // WITHDRAW RENT
  // ------------------------
  const withdrawRent = (leaseId: number, amountWei: string) => {
    writeContract({
      abi: leaseAbi,
      address: LEASE_CONTRACT,
      functionName: "withdrawRent",
      args: [BigInt(leaseId), BigInt(amountWei)],
      account: address,
      chainId,
      chain: undefined,   // REQUIRED
    });
  };

  // ------------------------
  // RETURN SECURITY DEPOSIT
  // ------------------------
  const returnSecurityDeposit = (leaseId: number, amountWei: string) => {
    writeContract({
      abi: leaseAbi,
      address: LEASE_CONTRACT,
      functionName: "returnSecurityDeposit",
      args: [BigInt(leaseId), BigInt(amountWei)],
      account: address,
      chainId,
      chain: undefined,   // REQUIRED
    });
  };

  // ------------------------
  // CREATE LEASE
  // ------------------------
  const createLease = (
  leaseId: bigint,
  tenant: `0x${string}`,
  monthlyRentWei: bigint,
  securityDepositWei: bigint,
  startDateUnix: bigint
) => {
  writeContract({
    abi: leaseAbi,
    address: LEASE_CONTRACT,
    functionName: "createLease",
    args: [
      leaseId,
      tenant,
      monthlyRentWei,
      securityDepositWei,
      startDateUnix,
    ],
    account: address,
    chainId,
    chain: undefined,
  });
};



  // ------------------------
  // EDIT LEASE
  // ------------------------
  const editLease = (
    leaseId: number,
    newMonthlyRentWei: string,
    newSecurityDepositWei: string,
    newStartDateUnix: number
  ) => {
    writeContract({
      abi: leaseAbi,
      address: LEASE_CONTRACT,
      functionName: "editLease",
      args: [
        BigInt(leaseId),
        BigInt(newMonthlyRentWei),
        BigInt(newSecurityDepositWei),
        BigInt(newStartDateUnix),
      ],
      account: address,
      chainId,
      chain: undefined,   // REQUIRED
    });
  };

  // ------------------------
  // END LEASE
  // ------------------------
  const endLease = (leaseId: number) => {
    writeContract({
      abi: leaseAbi,
      address: LEASE_CONTRACT,
      functionName: "endLease",
      args: [BigInt(leaseId)],
      account: address,
      chainId,
      chain: undefined,   // REQUIRED
    });
  };

  return {
    payDeposit,
    payRent,
    withdrawRent,
    returnSecurityDeposit,
    createLease,
    editLease,
    endLease,
    isPending,
  };
};
