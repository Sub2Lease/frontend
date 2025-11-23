// src/components/dashboard/ProfileCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import WalletConnectButton from "./WalletConnectButton";

interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  loading: boolean;
  onRefresh: () => void;
  onInbox: () => void;
  onLogout: () => void;
}

const ProfileCard = ({ user, loading, onRefresh, onInbox, onLogout }: Props) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You are not logged in.</p>
          <Button className="w-full mt-2" onClick={() => (window.location.href = "/auth")}>
            Log In / Sign Up
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6 pb-4">

        {/* Avatar + Upload */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="w-20 h-20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <ImageUpload id={user.id} to="USER" callback={onRefresh} />
        </div>

        {/* Name + Email + Inbox */}
        <div className="flex flex-col items-center text-center gap-2">
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          {/* <Button
            variant="outline"
            size="sm"
            className="mt-1 w-full"
            onClick={onInbox}
          >
            Open Inbox
          </Button> */}
        </div>

        {/* Wallet Connect */}
        <div className="w-full flex justify-center">
          <WalletConnectButton />
        </div>

        {/* Logout */}
        <Button
          className="w-full mt-2"
          variant="destructive"
          onClick={onLogout}
        >
          Logout
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
