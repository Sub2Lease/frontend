// pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, DollarSign, RefreshCcw } from "lucide-react";
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
import { MessagesModal } from "@/components/MessagesModal";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { API_BASE, IMAGE_URL, LOCAL_STORAGE_USER_KEY } from "../constants";
import ImageUpload from "@/components/ImageUpload";

interface ApiUser {
  _id?: string;
  email?: string;
  name?: string;
  profileImage?: string;
}

interface ApiListing {
  _id?: string;
  rent?: number;
  address?: string;
  title?: string;
  capacity?: number;
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
  ownerSigned?: boolean;   // NEW
  tenantSigned?: boolean;  // NEW
}

interface Payment {
  id: string;
  date: string;
  endDate?: string;
  amount: number;
  status: string;      // human-readable status for the card
  property: string;
  agreementId: string; // so we can sign it
}


interface ApiAgreementWithListing extends ApiAgreement {
  listingTitle?: string;
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


const Dashboard = () => {
  const [triggerUserLoad, setTriggerUserLoad] = useState(false);
  const [isPostingLease, setIsPostingLease] = useState(false);
  const [postingLoading, setPostingLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [postedLeases, setPostedLeases] = useState<PostedLease[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [agreements, setAgreements] = useState<ApiAgreementWithListing[]>([]);

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

  // messaging modal state (for inbox button)
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxPeerId] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  // ---------- Load "current user" ----------
  useEffect(() => {
    const loadUser = async () => {
      setLoadingProfile(true);
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        console.log(raw);
        if (raw) {
          const u: ApiUser = JSON.parse(raw);
          if (u && (u._id || u.email)) {
            const id = (u._id || "").toString();
            const email = u.email || "";
            const name =
              u.name || (email ? email.split("@")[0] : "Sub2Lease User");
            const avatarUrl = u.profileImage ? IMAGE_URL(u.profileImage) : null;

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
        const avatarUrl = u.profileImage ? IMAGE_URL(u.profileImage) : null;

        setUserProfile({ id, name, email, avatarUrl });
      } catch (err) {
        console.error("Failed to load user", err);
        setUserProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUser();
  }, [triggerUserLoad]);

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
              const title = listing.title || listing.address || "My listing";
              const price = listing.rent ?? 0;

              return {
                id,
                title,
                price,
                status: "Active",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        const allAgreements: ApiAgreement[] = [];

        if (asOwnerRes.ok) {
          const arr: ApiAgreement[] = await asOwnerRes.json();
          allAgreements.push(...arr);
        }
        if (asTenantRes.ok) {
          const arr: ApiAgreement[] = await asTenantRes.json();
          allAgreements.push(...arr);
        }

        // Deduplicate by _id
        const seen = new Map<string, ApiAgreement>();
        for (const a of allAgreements) {
          const id = (a._id || "").toString();
          if (!id) continue;
          if (!seen.has(id)) seen.set(id, a);
        }
        const unique = Array.from(seen.values());

        // Fetch listings for each agreement to get titles
        const listingIds = Array.from(
          new Set(
            unique
              .map((a) => (a.listing ? a.listing.toString() : ""))
              .filter(Boolean)
          )
        );

        const listingTitleMap: Record<string, string> = {};

        await Promise.all(
          listingIds.map(async (lid) => {
            try {
              const res = await fetch(
                `${API_BASE}/listings?listingId=${encodeURIComponent(lid)}`
              );
              if (!res.ok) return;
              const arr: ApiListing[] = await res.json();
              const listing = arr[0];
              if (listing) {
                listingTitleMap[lid] =
                  listing.title || listing.address || "Sublease";
              }
            } catch (err) {
              console.error("Failed to load listing for agreement", err);
            }
          })
        );

        setAgreements(
          unique.map((a) => ({
            ...a,
            listingTitle: a.listing
              ? listingTitleMap[a.listing.toString()] || "Sublease"
              : "Sublease",
          }))
        );

        // inside useEffect that depends on userProfile
const userId = userProfile.id;

setPaymentHistory(
  unique.map((p) => {
    const id = (p._id || "").toString();
    const ownerId = p.owner?.toString();
    const tenantId = p.tenant?.toString();

    const ownerSigned = !!p.ownerSigned;
    const tenantSigned = !!p.tenantSigned;

    const youAreOwner = ownerId === userId;
    const youAreTenant = tenantId === userId;

    let status = "Unsigned";

    if (ownerSigned && tenantSigned) {
      status = "Fully signed";
    } else if (
      (youAreOwner && ownerSigned && !tenantSigned) ||
      (youAreTenant && tenantSigned && !ownerSigned)
    ) {
      status = "You signed – waiting for other party";
    } else if (
      (youAreOwner && !ownerSigned && tenantSigned) ||
      (youAreTenant && !tenantSigned && ownerSigned)
    ) {
      status = "Pending your signature";
    }

    return {
      id,
      agreementId: id,
      date: p.startDate || "",
      endDate: p.endDate || "",
      amount: p.rent ?? 0,
      status,
      property: p.propertyTitle || "",
    } as Payment;
  })
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
      const res = await fetch(`${API_BASE}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: userProfile.id,
          title: newLease.title.trim(),
          address: newLease.address,
          rent: Number(newLease.price),
          capacity: newLease.roommates ? Number(newLease.roommates) : 1,
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
        created.title || created.address || newLease.title || "My listing";
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

  const handleSignAgreement = async (agreementId: string) => {
    if (!userProfile) return;

    try {
      const res = await fetch(
        `${API_BASE}/agreements/${agreementId}/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userProfile.id }),
        }
      );

      if (!res.ok) {
        console.error("Failed to sign agreement", await res.text());
        alert("Failed to sign agreement.");
        return;
      }

      const updated: ApiAgreement = await res.json();

      setAgreements((prev) =>
        prev.map((a) =>
          (a._id || "").toString() === agreementId
            ? {
                ...a,
                ownerSigned: updated.ownerSigned,
                tenantSigned: updated.tenantSigned,
              }
            : a
        )
      );
    } catch (err) {
      console.error("Error signing agreement", err);
      alert("An error occurred while signing the agreement.");
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
                  appear on the properties page once submitted.
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
                      setNewLease((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
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
                    placeholder="123 College Ave, Madison, WI"
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
              <div className="flex gap-2">
                <CardTitle>Profile</CardTitle>
                <RefreshCcw className="cursor-pointer" onClick={() => setTriggerUserLoad(prev => !prev)} />
              </div>
              
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProfile ? (
                <div className="h-20 animate-pulse rounded-md bg-muted" />
              ) : userProfile ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Avatar className="w-20 h-20">
                        {userProfile.avatarUrl && (
                          <AvatarImage src={userProfile.avatarUrl} />
                        )}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <ImageUpload id={userProfile.id} to="USER" callback={() => setTriggerUserLoad(prev => !prev)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {userProfile.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userProfile.email}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setInboxOpen(true)}
                      >
                        Open Inbox
                      </Button>
                    </div>
                  </div>

                  <div>
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openConnectModal,
                        mounted,
                      }) => {
                        const ready = mounted;
                        const connected = ready && account && chain;

                        return (
                          <div
                            {...(!ready && {
                              "aria-hidden": true,
                              style: {
                                opacity: 0,
                                pointerEvents: "none",
                                userSelect: "none",
                              },
                            })}
                          >
                            {!connected ? (
                              <button
                                onClick={openConnectModal}
                                className="
                                  px-4 py-2 rounded-xl 
                                  bg-[#2a2a2a] text-white 
                                  border border-white/10 
                                  shadow-sm
                                  hover:bg-red-600 hover:border-red-600
                                  transition-all
                                "
                              >
                                Connect Wallet
                              </button>
                            ) : (
                              <button
                                onClick={openAccountModal}
                                className="
                                  px-4 py-2 rounded-xl 
                                  bg-[#2a2a2a] text-white 
                                  border border-white/10 
                                  shadow-sm
                                  hover:bg-red-600 hover:border-red-600
                                  transition-all
                                "
                              >
                                {account.displayName}
                              </button>
                            )}
                          </div>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You are not logged in.
                  </p>
                  <Button className="w-full" onClick={() => navigate("/auth")}>
                    Log In / Sign Up
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Smart Payments (still a simple agreements list) */}
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
                        {payment.property || "Sublease"} — {payment.date}
                      </p>
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

          {/* Current Subleases with signed/unsigned indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Current Subleases</CardTitle>
            </CardHeader>
            <CardContent>
              {agreements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have no lease agreements yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {agreements.map((a) => {
                    const id = (a._id || "").toString();
                    const youAreOwner = a.owner === userProfile?.id;
                    const role = youAreOwner ? "Owner" : "Tenant";
                    const youSigned = youAreOwner
                      ? !!a.ownerSigned
                      : !!a.tenantSigned;
                    const otherSigned = youAreOwner
                      ? !!a.tenantSigned
                      : !!a.ownerSigned;

                    let statusLabel = "Unsigned";
                    let statusVariant: "outline" | "default" =
                      "outline";

                    if (youSigned && otherSigned) {
                      statusLabel = "Fully signed";
                      statusVariant = "default";
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
                              {a.listingTitle || "Sublease"}{" "}
                              <span className="text-xs text-muted-foreground">
                                ({role})
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {a.startDate || "Start"} –{" "}
                              {a.endDate || "End"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rent ${a.rent ?? 0} •{" "}
                              {a.numPeople || 1} people
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={statusVariant} className="text-xs">
                              {statusLabel}
                            </Badge>
                            {!youSigned && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSignAgreement(id)}
                              >
                                Sign Agreement
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
        </div>
      </div>

      {/* Inbox modal */}
      {userProfile && (
        <MessagesModal
          open={inboxOpen}
          onOpenChange={setInboxOpen}
          currentUserId={userProfile.id}
          initialPeerId={inboxPeerId}
        />
      )}
    </div>
  );
};

export default Dashboard;
