import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "http://localhost:3000";

interface ApiUser {
  _id?: string;
  email?: string;
  name?: string;
  profileImage?: string;
}

interface ApiListing {
  _id?: string;
  // new schema fields
  title?: string;
  capacity?: number;
  // legacy / extra fields we still want to use
  rent?: number;
  address?: string;
  buildingName?: string;
  peopleCount?: number;
  images?: string[];
  description?: string;
  owner?: string;
}

interface ApiAgreement {
  _id?: string;
  startDate?: string;
  endDate?: string;
  rent?: number;
  payTerm?: string;
  listing?: string;
  owner?: string;
  tenant?: string;
  propertyTitle?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface PostedLease {
  id: string;
  title: string;
  price: number;
  status: string;
  views?: number;
}

interface Payment {
  id: string;
  date: string;
  endDate?: string;
  amount: number;
  status: string;
  property: string;
}

const Dashboard = () => {
  const [isPostingLease, setIsPostingLease] = useState(false);
  const [postingLoading, setPostingLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [postedLeases, setPostedLeases] = useState<PostedLease[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);

  const [newLease, setNewLease] = useState({
    title: "",
    price: "",
    roommates: "",
    address: "",
    from: "",
    to: "",
    amenities: "",
    description: "",
  });

  const navigate = useNavigate();

  // ---------- Load "current user" ----------
  useEffect(() => {
    const loadUser = async () => {
      setLoadingProfile(true);
      try {
        const raw = localStorage.getItem("sub2lease_user");
        if (raw) {
          const u: ApiUser = JSON.parse(raw);
          if (u && (u._id || u.email)) {
            const id = (u._id || "").toString();
            const email = u.email || "";
            const name =
              u.name || (email ? email.split("@")[0] : "Sub2Lease User");
            const avatarUrl = u.profileImage || null;

            setUserProfile({ id, name, email, avatarUrl });
            return;
          }
        }

        // Fallback: use first user from /users so dev still works
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) {
          console.error("Failed to load users:", res.status);
          setUserProfile(null);
          return;
        }

        const users: ApiUser[] = await res.json();
        if (!users || users.length === 0) {
          setUserProfile(null);
          return;
        }

        const u = users[0];
        const id = (u._id || "").toString();
        const email = u.email || "";
        const name =
          u.name || (email ? email.split("@")[0] : "Sub2Lease User");
        const avatarUrl = u.profileImage || null;

        setUserProfile({ id, name, email, avatarUrl });
      } catch (err) {
        console.error("Failed to load user", err);
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUser();
  }, []);

  // ---------- Load dashboard data (listings + agreements) ----------
  useEffect(() => {
    if (!userProfile) return;

    const loadDashboard = async () => {
      try {
        // 1) My listings (as owner)
        const myListingsRes = await fetch(
          `${API_BASE}/listings?ownerId=${encodeURIComponent(userProfile.id)}`
        );
        if (myListingsRes.ok) {
          const data: ApiListing[] = await myListingsRes.json();
          setPostedLeases(
            data.map((listing) => {
              const id = (listing._id || "").toString();
              const title =
                listing.title ||
                listing.buildingName ||
                listing.address ||
                "My listing";
              const price = listing.rent ?? 0;

              return {
                id,
                title,
                price,
                status: "Active",
                views: (listing as any).views ?? 0,
              };
            })
          );
        }

        // 2) Agreements / payments – as owner and as tenant
        const [asOwnerRes, asTenantRes] = await Promise.all([
          fetch(
            `${API_BASE}/agreements?ownerId=${encodeURIComponent(
              userProfile.id
            )}`
          ),
          fetch(
            `${API_BASE}/agreements?tenantId=${encodeURIComponent(
              userProfile.id
            )}`
          ),
        ]);

        const payments: ApiAgreement[] = [];

        if (asOwnerRes.ok) {
          const arr: ApiAgreement[] = await asOwnerRes.json();
          payments.push(...arr);
        }
        if (asTenantRes.ok) {
          const arr: ApiAgreement[] = await asTenantRes.json();
          payments.push(...arr);
        }

        // Deduplicate by _id
        const seen = new Map<string, ApiAgreement>();
        for (const p of payments) {
          const id = (p._id || "").toString();
          if (!id) continue;
          if (!seen.has(id)) seen.set(id, p);
        }

        const unique = Array.from(seen.values());

        setPaymentHistory(
          unique.map((p) => ({
            id: (p._id || "").toString(),
            date: p.startDate || "",
            endDate: p.endDate || "",
            amount: p.rent ?? 0,
            status: p.payTerm || "Active",
            property: p.propertyTitle || "",
          }))
        );
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    loadDashboard();
  }, [userProfile]);

  const initials =
    userProfile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  // pick "current sublease" as first agreement for now
  const currentSublease = paymentHistory[0] || null;

  // ---------- Post new listing ----------
  const handleSubmitListing = async () => {
    if (!userProfile) {
      alert("You must be logged in to post a sublease.");
      return;
    }

    if (!newLease.title || !newLease.price) {
      alert("Please enter at least a title and price.");
      return;
    }

    setPostingLoading(true);

    try {
      const capacityValue = newLease.roommates
        ? Number(newLease.roommates)
        : 1;

      const res = await fetch(`${API_BASE}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: userProfile.id,
          // schema-required fields
          title: newLease.title.trim(),
          capacity: capacityValue,
          // keep legacy / extra fields populated too
          buildingName: newLease.title.trim(),
          peopleCount: capacityValue,
          address: newLease.address,
          rent: Number(newLease.price),
          startDate: newLease.from || null,
          endDate: newLease.to || null,
          description: newLease.description || null,
          amenities: newLease.amenities
            ? newLease.amenities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],
        }),
      });

      if (!res.ok) {
        console.error("Create listing failed", await res.text());
        alert("Failed to create sublease. Please try again.");
        return;
      }

      const created: ApiListing = await res.json();

      const id = (created._id || "").toString();
      const title =
        created.title ||
        created.buildingName ||
        created.address ||
        newLease.title ||
        "My listing";
      const price = created.rent ?? 0;

      setPostedLeases((prev) => [
        {
          id,
          title,
          price,
          status: "Active",
          views: 0,
        },
        ...prev,
      ]);

      setNewLease({
        title: "",
        price: "",
        roommates: "",
        address: "",
        from: "",
        to: "",
        amenities: "",
        description: "",
      });
      setIsPostingLease(false);
    } catch (err) {
      console.error("Error creating listing", err);
      alert("Failed to create sublease. Please try again.");
    } finally {
      setPostingLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">Dashboard</span>
          </h1>

          <Dialog open={isPostingLease} onOpenChange={setIsPostingLease}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Post a Sublease
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Post a New Sublease</DialogTitle>
                <DialogDescription>
                  Fill in the details about your property. Your listing will
                  appear on the map once submitted.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    placeholder="Modern Studio Near Campus"
                    value={newLease.title}
                    onChange={(e) =>
                      setNewLease((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Month</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="850"
                      value={newLease.price}
                      onChange={(e) =>
                        setNewLease((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roommates">Number of Roommates</Label>
                    <Input
                      id="roommates"
                      type="number"
                      placeholder="0"
                      value={newLease.roommates}
                      onChange={(e) =>
                        setNewLease((prev) => ({
                          ...prev,
                          roommates: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 State St, Madison, WI"
                    value={newLease.address}
                    onChange={(e) =>
                      setNewLease((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">Available From</Label>
                    <Input
                      id="from"
                      type="date"
                      value={newLease.from}
                      onChange={(e) =>
                        setNewLease((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to">Available To</Label>
                    <Input
                      id="to"
                      type="date"
                      value={newLease.to}
                      onChange={(e) =>
                        setNewLease((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">
                    Amenities (comma separated)
                  </Label>
                  <Input
                    id="amenities"
                    placeholder="WiFi, Parking, Laundry"
                    value={newLease.amenities}
                    onChange={(e) =>
                      setNewLease((prev) => ({
                        ...prev,
                        amenities: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property..."
                    rows={4}
                    value={newLease.description}
                    onChange={(e) =>
                      setNewLease((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmitListing}
                  disabled={postingLoading}
                >
                  {postingLoading ? "Posting..." : "Submit Listing"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 2x2 layout: Profile / Smart Payments on top, Posted Leases / Current Sublease below */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProfile ? (
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              ) : userProfile ? (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      {userProfile.avatarUrl && (
                        <AvatarImage src={userProfile.avatarUrl} />
                      )}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {userProfile.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You are not logged in.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Log In / Sign Up
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Smart Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Smart Contract Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have no payment history yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
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
                        {payment.date}
                      </p>
                      {/* TODO: show more sublease details here
                          (property name, role, schedule, etc.) in a nicer card format */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posted Leases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                My Posted Leases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {postedLeases.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have not posted any leases yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {postedLeases.map((lease) => (
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
                          <div className="text-sm text-muted-foreground">
                            {lease.views} views
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Sublease */}
          <Card>
            <CardHeader>
              <CardTitle>Current Sublease</CardTitle>
            </CardHeader>
            <CardContent>
              {!currentSublease ? (
                <p className="text-sm text-muted-foreground">
                  You have no active subleases yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {currentSublease.property || "Sublease"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ${currentSublease.amount}/mo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentSublease.date} –{" "}
                    {currentSublease.endDate || "ongoing"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
