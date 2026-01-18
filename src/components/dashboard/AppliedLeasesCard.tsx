// display for user to see leases they have applied to on dashboard

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { API_BASE, IMAGE_URL, LOCAL_STORAGE_USER_KEY } from "@/constants";

interface Lease {
  id: string;
  title: string;
  price: number;
  status: string;
  views?: number;
}

const AppliedLeasesCard = ({ leases }: { leases: Lease[] }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          My Applied Leases
        </CardTitle>
      </CardHeader>

      <CardContent>
        {leases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not posted any leases yet.
          </p>
        ) : (
          <div className="space-y-4">
            {leases.map((lease) => (
              <div
                key={lease.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold">{lease.title || "Lease"}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${lease.price}/mo
                  </p>
                </div>



                <div className="flex items-center gap-3">
                  <Badge variant="outline">{lease.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppliedLeasesCard;