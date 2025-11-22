import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  MapPin,
  Heart,
  FileText,
  DollarSign,
} from "lucide-react";
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

import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface PostedLease {
  id: string | number;
  title: string;
  price: number;
  status: string; // e.g. "Active", "Pending", "Ended"
  views?: number;
}

interface SavedProperty {
  id: string | number;
  title: string;
  price: number;
  address: string;
}

interface Payment {
  id: string | number;
  date: string; // ISO date
  amount: number;
  status: string; // e.g. "Completed", "Pending", "Failed"
  property: string;
}

const Dashboard = () => {
  const [isPostingLease, setIsPostingLease] = useState(false);
  const [postingLoading, setPostingLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [postedLeases, setPostedLeases] = useState<PostedLease[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
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

  // Load logged-in user from Supabase
  useEffect(() => {
    const loadUser = async () => {
      setLoadingProfile(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserProfile(null);
        setLoadingProfile(false);
        return;
      }

      let fullName: string | undefined;
      let avatarUrl: string | undefined;

      try {
        const { data: profileData } = await supabase
          .from("profiles") // change if your table is named differently
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          fullName = profileData.full_name ?? undefined;
          avatarUrl = profileData.avatar_url ?? undefined;
        }
      } catch {
        // ignore profile error; we'll fall back to auth data
      }

      const fallbackName =
        fullName ||
        (user.user_metadata &&
          (user.user_metadata.full_name || user.user_metadata.name)) ||
        (user.email ? user.email.split("@")[0] : "Sub2Lease User");

      setUserProfile({
        id: user.id,
        name: fallbackName,
        email: user.email ?? "",
        avatarUrl,
      });

      setLoadingProfile(false);
    };

    loadUser();
  }, []);

  // TODO: later, load postedLeases, savedProperties, paymentHistory from Supabase
  // useEffect(() => {
  //   if (!userProfile) return;
  //   supabase.from("subleases").select("*").eq("owner_id", userProfile.id)...
  // }, [userProfile]);

  const initials =
    userProfile?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

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

    const { data, error } = await supabase
      .from("subleases") // change table name if needed
      .insert({
        title: newLease.title,
        price: Number(newLease.price),
        address: newLease.address || null,
        available_from: newLease.from || null,
        available_to: newLease.to || null,
        roommates: newLease.roommates
          ? Number(newLease.roommates)
          : null,
        amenities: newLease.amenities || null,
        description: newLease.description || null,
        owner_id: userProfile.id, // make sure this column exists
      })
      .select("*")
      .single();

    setPostingLoading(false);

    if (error) {
      console.error("Error creating sublease:", error);
      alert("Failed to create sublease. Please try again.");
      return;
    }

    // Update "My Posted Leases" immediately
    setPostedLeases((prev) => [
      {
        id: data.id,
        title: data.title,
        price: data.price ?? 0,
        status: "Active",
        views: 0,
      },
      ...prev,
    ]);

    // Clear the form
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

    // Close the dialog
    setIsPostingLease(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile */}
          <Card className="lg:col-span-1">
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

          {/* Posted Leases */}
          <Card className="lg:col-span-2">
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

          {/* Saved Properties */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Saved Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have not saved any properties yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {savedProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold">{property.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {property.address}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        ${property.price}/mo
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="lg:col-span-1">
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
                    </div>
                  ))}
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
