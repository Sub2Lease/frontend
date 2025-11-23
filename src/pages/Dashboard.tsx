// src/pages/Dashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileCard from "@/components/dashboard/ProfileCard";
import PaymentsCard from "@/components/dashboard/PaymentsCard";
import PostedLeasesCard from "@/components/dashboard/PostedLeasesCard";
import AgreementsCard from "@/components/dashboard/AgreementsCard";
import PostLeaseDialog from "@/components/dashboard/PostLeaseDialog";

import { MessagesModal } from "@/components/MessagesModal";
import { useLeasePayments } from "@/hooks/useLeasePayments";

import { API_BASE, IMAGE_URL, LOCAL_STORAGE_USER_KEY } from "@/constants";

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
  ownerSigned?: boolean;
  tenantSigned?: boolean;
}

const Dashboard = () => {
  const [triggerUserLoad, setTriggerUserLoad] = useState(false);

  const [userProfile, setUserProfile] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [postedLeases, setPostedLeases] = useState([]);
  const [agreements, setAgreements] = useState<ApiAgreement[]>([]);

  // 🔥 NEW Web3 payments
  const { leases, payments, isLoading: paymentsLoading } = useLeasePayments();

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);

  const navigate = useNavigate();

  // --------------------------
  // 1. Load logged-in user
  // --------------------------
  useEffect(() => {
    const loadUser = async () => {
      setLoadingProfile(true);

      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

        if (raw) {
          const u: ApiUser = JSON.parse(raw);

          if (u && (u._id || u.email)) {
            const id = String(u._id || "");
            const email = u.email || "";
            const name = u.name || email.split("@")[0];
            const avatarUrl = u.profileImage ? IMAGE_URL(u.profileImage) : null;

            setUserProfile({ id, name, email, avatarUrl });
            setLoadingProfile(false);
            return;
          }
        }

        // fallback dev mode
        const res = await fetch(`${API_BASE}/users`);
        const users: ApiUser[] = res.ok ? await res.json() : [];

        if (users.length > 0) {
          const u = users[0];
          const id = String(u._id || "");
          const email = u.email || "";
          const name = u.name || email.split("@")[0];
          const avatarUrl = u.profileImage ? IMAGE_URL(u.profileImage) : null;

          setUserProfile({ id, name, email, avatarUrl });
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        setUserProfile(null);
      }

      setLoadingProfile(false);
    };

    loadUser();
  }, [triggerUserLoad]);

  // --------------------------
  // 2. Load listings + agreements
  // --------------------------
  useEffect(() => {
    if (!userProfile) return;

    const fetchData = async () => {
      try {
        // Load user's listings
        const listingsRes = await fetch(
          `${API_BASE}/listings?ownerId=${encodeURIComponent(userProfile.id)}`
        );
        const listings = listingsRes.ok ? await listingsRes.json() : [];

        setPostedLeases(
          listings.map((l: ApiListing) => ({
            id: String(l._id),
            title: l.title || l.address,
            price: l.rent ?? 0,
            status: "Active",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            views: (l as any).views ?? 0,
          }))
        );

        // Load agreements (owner + tenant)
        const [ownerRes, tenantRes] = await Promise.all([
          fetch(`${API_BASE}/agreements?ownerId=${userProfile.id}`),
          fetch(`${API_BASE}/agreements?tenantId=${userProfile.id}`),
        ]);

        const all = [
          ...(ownerRes.ok ? await ownerRes.json() : []),
          ...(tenantRes.ok ? await tenantRes.json() : []),
        ];

        const unique = Array.from(
          new Map(all.map((a) => [String(a._id), a])).values()
        );

        setAgreements(unique);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      }
    };

    fetchData();
  }, [userProfile]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>

          <PostLeaseDialog
            open={postDialogOpen}
            onOpenChange={setPostDialogOpen}
            ownerId={userProfile?.id}
            onCreated={() => setTriggerUserLoad((x) => !x)}
          />
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileCard
            user={userProfile}
            loading={loadingProfile}
            onRefresh={() => setTriggerUserLoad((x) => !x)}
            onInbox={() => setInboxOpen(true)}
          />

          {/* 🔥 Blockchain Payments */}
          <PaymentsCard
            leases={leases}
            payments={payments}
            isLoading={paymentsLoading}
            onPayDeposit={(leaseId, amount) => console.log("Deposit", leaseId, amount)}
            onPayRent={(leaseId, amount) => console.log("Rent", leaseId, amount)}
          />


          <PostedLeasesCard leases={postedLeases} />

          <AgreementsCard agreements={agreements} userId={userProfile?.id} />
        </div>
      </div>

      {userProfile && (
        <MessagesModal
          open={inboxOpen}
          onOpenChange={setInboxOpen}
          currentUserId={userProfile.id}
          initialPeerId={undefined}
        />
      )}
    </div>
  );
};

export default Dashboard;
