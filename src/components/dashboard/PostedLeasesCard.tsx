// src/components/dashboard/PostedLeasesCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface Lease {
  id: string;
  title: string;
  price: number;
  status: string;
  views?: number;
}

const PostedLeasesCard = ({ leases }: { leases: Lease[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          My Posted Leases
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
                  <h4 className="font-semibold">{lease.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${lease.price}/mo
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">{lease.status}</Badge>
                  {lease.views !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {lease.views} views
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostedLeasesCard;