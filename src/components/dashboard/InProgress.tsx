// display to see all current in-progress leases (fully signed agreements) on dashboard 

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ActivateSmartPaymentsButton from "./ActivateSmartPaymentsButton";
import LeasePaymentControls from "@/components/LeasePaymentControls";
import { useLeasePaymentsOwner } from "@/hooks/useLeasePaymentsOwner";

interface Agreement {
  _id: string;
  listingTitle: string;
  rent: number;
  securityDeposit: number;
  numPeople: number;
  startDate: string;
  endDate: string;
  owner: string;
  tenant: string;
  ownerSigned: boolean;
  tenantSigned: boolean;
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
  tenant,
}: {
  agreements: Agreement[];
  userProfile: UserProfile;
  tenant: boolean;
}) => {
  if (!userProfile) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { leases: ownerLeases } = useLeasePaymentsOwner();

  // Only show agreements fully signed
  let signed = agreements.filter((a) => a.ownerSigned && a.tenantSigned);

  if (tenant) {
    signed = signed.filter((a) => a.tenant === userProfile.id);
  } else {
    signed = signed.filter((a) => a.owner === userProfile.id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Leases</CardTitle>
      </CardHeader>

      <CardContent>
        {signed.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active leases found.</p>
        ) : (
          <div className="space-y-3">
            {signed.map((a) => {
              if (!a._id || a._id.length < 16) return null;

              const leaseId = BigInt("0x" + a._id.slice(0, 16));
              const youAreOwner = a.owner === userProfile.id;

              const leaseExistsOnChain = ownerLeases.some(
                (l) => String(l.leaseId) === String(leaseId)
              );

              return (
                <div
                  key={a._id}
                  className="p-3 border border-border rounded-lg flex items-center justify-between"
                >
                  {/* LEFT */}
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
                      Rent ${a.rent} • {a.numPeople} people
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-col gap-2 items-end">
                    {youAreOwner && !leaseExistsOnChain && (
                      <ActivateSmartPaymentsButton
                        agreement={a}
                        userProfile={userProfile}
                      />
                    )}

                    {leaseExistsOnChain && (
                      <LeasePaymentControls
                        lease={{
                          leaseId,
                          monthlyRent: BigInt(a.rent),
                          securityDeposit: BigInt(a.securityDeposit),
                          rentAvailableToWithdraw: BigInt(0),
                          depositHeld: BigInt(0),
                        }}
                        isOwner={youAreOwner}
                      />
                    )}
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
