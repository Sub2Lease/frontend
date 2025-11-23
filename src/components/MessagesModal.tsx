// MessagesModal.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE = "https://sub2leasebackend.onrender.com";

interface ApiMessage {
  _id?: string;
  sender: string;
  users: string[];
  content: string;
  createdAt?: string;
}

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  initialPeerId?: string;
}

export function MessagesModal({
  open,
  onOpenChange,
  currentUserId,
  initialPeerId,
}: MessagesModalProps) {
  const [allMessages, setAllMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePeerId, setActivePeerId] = useState<string | null>(
    initialPeerId ?? null
  );
  const [draft, setDraft] = useState("");

  // Load all messages for this user when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/messages?user=${encodeURIComponent(currentUserId)}`
        );
        if (!res.ok) {
          console.error("Failed to load messages", await res.text());
          return;
        }
        const msgs: ApiMessage[] = await res.json();

        // sort earliest first
        msgs.sort((a, b) => {
          const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
          const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
          return ta - tb;
        });

        setAllMessages(msgs);

        if (!activePeerId && msgs.length > 0) {
          // default peer = first conversation or initialPeerId if present
          const peers = new Set<string>();
          for (const m of msgs) {
            const other = m.users.find((u) => u !== currentUserId) ?? currentUserId;
            peers.add(other);
          }
          if (initialPeerId && peers.has(initialPeerId)) {
            setActivePeerId(initialPeerId);
          } else {
            const first = peers.values().next().value as string | undefined;
            if (first) setActivePeerId(first);
          }
        } else if (initialPeerId && activePeerId !== initialPeerId) {
          setActivePeerId(initialPeerId);
        }
      } catch (err) {
        console.error("Error loading messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUserId]);

  // group by other participant
  const conversations = useMemo(() => {
    const map = new Map<string, ApiMessage[]>();
    for (const m of allMessages) {
      const other = m.users.find((u) => u !== currentUserId) ?? currentUserId;
      if (!map.has(other)) map.set(other, []);
      map.get(other)!.push(m);
    }
    return map;
  }, [allMessages, currentUserId]);

  const activeMessages = useMemo(() => {
    if (!activePeerId) return [];
    const msgs = conversations.get(activePeerId) ?? [];
    // ensure earliest first
    return [...msgs].sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return ta - tb;
    });
  }, [conversations, activePeerId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeerId || !draft.trim()) return;

    const content = draft.trim();
    setDraft("");

    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: currentUserId,
          to: activePeerId,
          content,
        }),
      });

      if (!res.ok) {
        console.error("Send message failed", await res.text());
        return;
      }

      const saved: ApiMessage = await res.json();
      setAllMessages((prev) => [...prev, saved]);
    } catch (err) {
      console.error("Send message error", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setDraft("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          {/* Conversation list */}
          <div className="col-span-1 border-r border-border pr-3 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Conversations
            </h3>
            {loading && (
              <p className="text-xs text-muted-foreground">Loading…</p>
            )}
            {!loading && conversations.size === 0 && (
              <p className="text-xs text-muted-foreground">
                No messages yet. Start a conversation from a listing.
              </p>
            )}
            {!loading &&
              Array.from(conversations.keys()).map((peerId) => (
                <button
                  key={peerId}
                  type="button"
                  onClick={() => setActivePeerId(peerId)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-xs border",
                    "hover:bg-accent hover:border-accent-foreground/20",
                    activePeerId === peerId
                      ? "bg-accent border-accent-foreground/30"
                      : "border-border/60"
                  )}
                >
                  <div className="font-medium">
                    User {peerId.slice(0, 6)}…
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {conversations.get(peerId)?.slice(-1)[0]?.content ?? ""}
                  </div>
                </button>
              ))}
          </div>

          {/* Active conversation */}
          <div className="col-span-2 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!activePeerId && (
                <p className="text-sm text-muted-foreground">
                  Select a conversation to start messaging.
                </p>
              )}

              {activePeerId &&
                activeMessages.map((m) => {
                  const fromMe = m.sender === currentUserId;
                  return (
                    <div
                      key={m._id}
                      className={cn("flex", fromMe ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                          fromMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <div>{m.content}</div>
                        {m.createdAt && (
                          <div className="mt-1 text-[10px] opacity-80">
                            {new Date(m.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Input */}
            {activePeerId && (
              <form
                onSubmit={handleSend}
                className="mt-3 flex items-center gap-2"
              >
                <Input
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button type="submit" disabled={!draft.trim()}>
                  Send
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
