// src/components/dashboard/InProgress.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/constants";
import { useState } from "react";
import ActivateSmartPaymentsButton from "./ActivateSmartPaymentsButton";

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

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
}
const InProgress = ({
  agreements,
  userProfile,
  tenant,   // true = viewing tenant tab, false = viewing owner tab
}: {
  agreements: Agreement[];
  userProfile: UserProfile;
  tenant: boolean;
}) => {

  if (!userProfile || !userProfile.id) return null;

  // 1) Only show fully signed agreements
  let signedAgreements = agreements.filter(
    (a) => a.ownerSigned && a.tenantSigned
  );

  // 2) Filter by role depending on active tab
  if (tenant) {
    // Tenant tab → only agreements where user is the tenant
    signedAgreements = signedAgreements.filter(
      (a) => a.tenant === userProfile.id
    );
  } else {
    // Owner tab → only agreements where user is the owner
    signedAgreements = signedAgreements.filter(
      (a) => a.owner === userProfile.id
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Leases</CardTitle>
      </CardHeader>

      <CardContent>
        {signedAgreements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active leases found.
          </p>
        ) : (
          <div className="space-y-3">
            {signedAgreements.map((a) => {
              const id = a._id!;
              const youAreOwner = a.owner === userProfile.id;

              return (
                <div
                key={id}
                className="p-3 border border-border rounded-lg flex items-center justify-between"
                >
                {/* LEFT SIDE */}
                <div className="space-y-1">
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

                {/* RIGHT SIDE — ACTIVATE SMART PAYMENTS BUTTON */}
                {!youAreOwner ? null : (
                  <ActivateSmartPaymentsButton agreement={a} userProfile={userProfile} />
                )}
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
