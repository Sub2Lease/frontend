import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LeaseStruct, PaymentItem } from "@/hooks/useLeasePayments";

interface Props {
  leases: LeaseStruct[];
  payments: PaymentItem[];
  isLoading: boolean;
  onPayDeposit?: (leaseId: number, amount: string) => void;
  onPayRent?: (leaseId: number, amount: string) => void;
}

const PaymentsCard = ({
  leases,
  payments,
  isLoading,
  onPayDeposit,
  onPayRent,
}: Props) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!leases || leases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-lg font-semibold mb-2">Smart-Payment Not Setup</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Deposit needed
  const leasesNeedingDeposit = leases.filter(
    (l) => l.depositHeld === 0n && l.securityDeposit > 0n
  );

  if (leasesNeedingDeposit.length > 0) {
    const lease = leasesNeedingDeposit[0];
    const depositWei = lease.securityDeposit.toString();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium mb-3">
            Lease #{Number(lease.leaseId)} — Security Deposit Required
          </p>

          <p className="mb-2 text-sm text-muted-foreground">
            Security Deposit: {depositWei} WEI
          </p>

          <Button
            className="w-full"
            onClick={() =>
              onPayDeposit?.(Number(lease.leaseId), depositWei)
            }
          >
            Pay Security Deposit
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Rent needed
  const leasesNeedingRent = leases.filter(
    (l) => l.depositHeld === l.securityDeposit && l.paymentTimestamps.length === 0
  );

  if (leasesNeedingRent.length > 0) {
    const lease = leasesNeedingRent[0];
    const rentWei = lease.monthlyRent.toString();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium mb-3">
            Lease #{Number(lease.leaseId)} — First Rent Due
          </p>

          <p className="mb-2 text-sm text-muted-foreground">
            Monthly Rent: {rentWei} WEI
          </p>

          <Button
            className="w-full"
            onClick={() => onPayRent?.(Number(lease.leaseId), rentWei)}
          >
            Pay Rent
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show payment history
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Contract Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.map((p) => (
          <div key={p.id} className="p-3 border rounded-lg mb-2">
            <div className="flex justify-between">
              <span>{p.amount} WEI</span>
              <span>{p.status}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {p.property} — {p.date}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PaymentsCard;
