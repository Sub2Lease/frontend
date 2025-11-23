// src/components/dashboard/PaymentsCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  date: string;
  endDate?: string;
  status: string;
  property: string;
}

const PaymentsCard = ({ payments }: { payments: Payment[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Smart Contract Payments
        </CardTitle>
      </CardHeader>

      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have no payment history yet.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-3 border border-border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ${payment.amount}
                  </span>

                  <Badge variant="outline" className="text-xs">
                    {payment.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                  {payment.property} — {payment.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsCard;
