// src/components/LeasePaymentControls.tsx

import { Button } from "@/components/ui/button";
import { useLeaseActions } from "@/hooks/useLeaseActions";
import { useState } from "react";

export default function LeasePaymentControls({ lease, isOwner }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lease: any;
  isOwner: boolean;
}) {
  const { payDeposit, payRent, withdrawRent, returnSecurityDeposit } =
    useLeaseActions();

  const [loading, setLoading] = useState(false);

  const handlePayDeposit = () => {
    setLoading(true);
    try {
      payDeposit(Number(lease.leaseId), lease.securityDeposit.toString());
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = () => {
    setLoading(true);
    try {
      payRent(Number(lease.leaseId), lease.monthlyRent.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRent = () => {
    setLoading(true);
    try {
      withdrawRent(
        Number(lease.leaseId),
        lease.rentAvailableToWithdraw.toString()
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReturnDeposit = () => {
    setLoading(true);
    try {
      returnSecurityDeposit(Number(lease.leaseId), lease.depositHeld.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">

      {/* Tenant side */}
      {!isOwner && (
        <>
          <Button size="sm" disabled={loading} onClick={handlePayDeposit}>
            Pay Security Deposit
          </Button>

          <Button size="sm" disabled={loading} onClick={handlePayRent}>
            Pay Rent
          </Button>
        </>
      )}

      {/* Owner side */}
      {isOwner && (
        <>
          <Button size="sm" disabled={loading} onClick={handleWithdrawRent}>
            Withdraw Rent
          </Button>

          <Button size="sm" disabled={loading} onClick={handleReturnDeposit}>
            Return Security Deposit
          </Button>
        </>
      )}
    </div>
  );
}
