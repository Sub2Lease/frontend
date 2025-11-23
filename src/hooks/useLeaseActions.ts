import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
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
  const payDeposit = (leaseId: number, amountEth: string) => {
    if (!address || !chainId) throw new Error("Wallet not connected");

    writeContract({
        abi: leaseAbi,
        address: LEASE_CONTRACT,
        functionName: "fundSecurityDeposit",
        args: [BigInt(leaseId)],
        value: parseEther(amountEth),
        account: address,
        chainId,
        chain: undefined
    });
  };

  // ------------------------
  // PAY RENT
  // ------------------------
  const payRent = (leaseId: number, amountEth: string) => {
    if (!address || !chainId) throw new Error("Wallet not connected");

    writeContract({
        abi: leaseAbi,
        address: LEASE_CONTRACT,
        functionName: "depositRent",
        args: [BigInt(leaseId)],
        value: parseEther(amountEth),
        account: address,
        chainId,
        chain: undefined
    });
  };

  return { payDeposit, payRent, isPending };
};
