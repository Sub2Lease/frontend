//display for history of chats between user 

import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

export function ConversationPreview({ active, peerId, lastMessage, onClick }: {
  active: boolean;
  peerId: string;
  lastMessage: string;
  onClick: (value: string) => void;
}) {
  const { data: peer, isLoading }= useUser(peerId);
  return isLoading ? null : <button
    className={cn(
      "w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/60 transition-colors",
      active && "bg-primary text-primary-foreground"
    )}
    onClick={() => onClick(peerId)}
  >
    <div className="font-medium text-sm truncate">
      {peer.name}
    </div>
    <div className="text-xs text-muted-foreground truncate">
      {lastMessage}
    </div>
  </button>;
}