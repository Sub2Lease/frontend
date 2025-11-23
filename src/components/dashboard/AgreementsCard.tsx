// src/components/dashboard/AgreementsCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/constants";
import { useState } from "react";

interface Agreement {
  _id?: string;
  listingTitle?: string;
  rent?: number;
  numPeople?: number;
  startDate?: string;
  endDate?: string;
  owner?: string;
  tenant?: string;
  ownerSigned?: boolean;
  tenantSigned?: boolean;
}

const AgreementsCard = ({
  agreements,
  userId,
}: {
  agreements: Agreement[];
  userId: string;
}) => {
  const [warned, setWarned] = useState(false);
  if (!userId) return null;

  const date = new Date().toLocaleDateString();

  const handleSignAgreement = async (agreementId: string) => {
    if (!warned) {
      alert(`By signing this agreement on ${date}, you confirm that you have read and agree to the terms of the lease agreement. If you wish to continue, click CONFIRM`);
      setWarned(true);
      return;
    }
    
    await fetch(`${API_BASE}/agreements/${agreementId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending & Completed Leases</CardTitle>
      </CardHeader>

      <CardContent>
        {agreements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have no lease agreements yet.
          </p>
        ) : (
          <div className="space-y-3">
            {agreements.map((a) => {
              const id = a._id!;
              const youAreOwner = a.owner === userId;
              const youSigned = youAreOwner ? a.ownerSigned : a.tenantSigned;
              const otherSigned = youAreOwner ? a.tenantSigned : a.ownerSigned;

              let statusLabel = "Unsigned";
              let variant: "default" | "outline" = "outline";

              if (youSigned && otherSigned) {
                statusLabel = "Fully signed";
                variant = "default";
              } else if (youSigned && !otherSigned) {
                statusLabel = "Waiting for other party";
              } else if (!youSigned && otherSigned) {
                statusLabel = "Awaiting your signature";
              }

              return (
                <div
                  key={id}
                  className="p-3 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {a.listingTitle}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({youAreOwner ? "Owner" : "Tenant"})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.startDate} – {a.endDate}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rent ${a.rent} • {a.numPeople || 1} people
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={variant} className="text-xs">
                        {statusLabel}
                      </Badge>

                      {!youSigned && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSignAgreement(id)}
                        >
                          {!warned ? 'Sign Agreement' : 'Confirm Signature'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgreementsCard;
