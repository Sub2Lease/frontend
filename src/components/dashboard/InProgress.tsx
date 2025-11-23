// src/components/dashboard/InProgress.tsx
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

const InProgress = ({
    agreements,
    userId,
    tenant,
}: {
  agreements: Agreement[];
  userId: string;
  tenant: boolean;
    }) => {
  const signedAgreements = agreements.filter(
    (a) => a.ownerSigned && a.tenantSigned
  );
    
  const [warned, setWarned] = useState(false);
  if (!userId) return null;

  const date = new Date().toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Leases</CardTitle>
      </CardHeader>

      <CardContent>
        {signedAgreements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have no lease agreements yet.
          </p>
        ) : (
          <div className="space-y-3">
            {signedAgreements.map((a) => {
              const id = a._id!;
              const youAreOwner = a.owner === userId;

              return (
                <div
                  key={id}
                  className="p-3 border border-border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
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
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InProgress;
