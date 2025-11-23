// src/components/dashboard/ProfileCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import WalletConnectButton from "./WalletConnectButton";
import { RefreshCcw } from "lucide-react";

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
}

const ProfileCard = ({ user, loading, onRefresh, onInbox }: Props) => {
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
        <div className="flex items-center gap-2">
          <CardTitle>Profile</CardTitle>
          <RefreshCcw className="cursor-pointer" onClick={onRefresh} />
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-20 h-20">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <ImageUpload id={user.id} to="USER" callback={onRefresh} />
          </div>

          <div>
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onInbox}
            >
              Open Inbox
            </Button>
          </div>
        </div>

        <WalletConnectButton />
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
