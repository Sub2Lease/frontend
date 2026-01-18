//messaging UI on properties 

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { API_BASE } from "../constants";
import { ConversationPreview } from "./ConversationPreview";

interface Message {
  _id?: string;
  sender: string;
  users: string[];
  content: string;
  createdAt?: string;
}

interface ConversationPreview {
  peerId: string;
  lastMessage: string;
  lastTimestamp?: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | undefined>(
    initialPeerId
  );
  const [draft, setDraft] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { data: user, isLoading: userLoading } = useUser(currentUserId);
  const { data: peer, isLoading: peerLoading } = useUser(activePeerId);
  const loading = userLoading || peerLoading;

  // chat scroll container
  const chatRef = useRef<HTMLDivElement | null>(null);

  // Load all conversations for current user
  useEffect(() => {
    if (!open || !currentUserId) return;

    const loadConversations = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/messages?user=${encodeURIComponent(currentUserId)}`
        );
        if (!res.ok) {
          console.error("Failed to load messages list", await res.text());
          return;
        }

        const allMessages: Message[] = await res.json();

        // group by peer (other user in .users array)
        const byPeer = new Map<string, Message[]>();
        for (const m of allMessages) {
          const peer =
            m.users.find((u) => u !== currentUserId) || m.sender || "unknown";
          if (!byPeer.has(peer)) byPeer.set(peer, []);
          byPeer.get(peer)!.push(m);
        }

        const previews: ConversationPreview[] = [];
        for (const [peerId, msgs] of byPeer.entries()) {
          // sort ascending by time
          msgs.sort((a, b) => {
            const ta = new Date(a.createdAt ?? 0).getTime();
            const tb = new Date(b.createdAt ?? 0).getTime();
            return ta - tb;
          });
          const last = msgs[msgs.length - 1];
          previews.push({
            peerId,
            lastMessage: last?.content ?? "",
            lastTimestamp: last?.createdAt,
          });
        }

        // newest conversation at top of inbox
        previews.sort((a, b) => {
          const ta = new Date(a.lastTimestamp ?? 0).getTime();
          const tb = new Date(b.lastTimestamp ?? 0).getTime();
          return tb - ta;
        });

        setConversations(previews);

        // If we have an initial peer and it's in the list, auto-select it
        if (initialPeerId) {
          setActivePeerId(initialPeerId);
        } else if (!activePeerId && previews.length > 0) {
          setActivePeerId(previews[0].peerId);
        }
      } catch (err) {
        console.error("Error loading conversations", err);
      }
    };

    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentUserId]);

  // Load messages for active peer
  useEffect(() => {
    if (!open || !currentUserId || !activePeerId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `${API_BASE}/messages?user=${encodeURIComponent(
            currentUserId
          )}&user2=${encodeURIComponent(activePeerId)}`
        );
        if (!res.ok) {
          console.error("Failed to load conversation", await res.text());
          setMessages([]);
          return;
        }
        const data: Message[] = await res.json();

        // sort oldest → newest, like WhatsApp/Snapchat
        data.sort((a, b) => {
          const ta = new Date(a.createdAt ?? 0).getTime();
          const tb = new Date(b.createdAt ?? 0).getTime();
          return ta - tb;
        });

        setMessages(data);
      } catch (err) {
        console.error("Error loading conversation", err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [open, currentUserId, activePeerId]);

  // Scroll to bottom whenever messages change, active conversation changes, or modal opens
  useEffect(() => {
    if (!open) return;
    const el = chatRef.current;
    if (!el) return;
    // scroll to bottom
    el.scrollTop = el.scrollHeight;
  }, [messages, activePeerId, open]);

  const sortedMessages = useMemo(() => messages.reverse(), [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !activePeerId) return;

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
        console.error("Failed to send message", await res.text());
        return;
      }

      const saved: Message = await res.json();

      // Append at bottom
      setMessages((prev) => [...prev, saved]);

      // Update conversation preview
      setConversations((prev) => {
        const next = [...prev];
        const idx = next.findIndex((c) => c.peerId === activePeerId);
        const updated: ConversationPreview = {
          peerId: activePeerId,
          lastMessage: content,
          lastTimestamp: saved.createdAt,
        };
        if (idx === -1) next.unshift(updated);
        else {
          next[idx] = updated;
          // move to top
          next.sort((a, b) => {
            const ta = new Date(a.lastTimestamp ?? 0).getTime();
            const tb = new Date(b.lastTimestamp ?? 0).getTime();
            return tb - ta;
          });
        }
        return next;
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return loading ? null : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[75vh] flex flex-col bg-background">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold">Messages</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Inbox list */}
          <div className="w-64 bg-muted/40 rounded-lg flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-semibold">
              Inbox
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No messages yet.
                </div>
              ) : (
                conversations.map(({ peerId, lastMessage }) => (
                  <ConversationPreview
                    key={peerId}
                    active={activePeerId === peerId}
                    peerId={peerId}
                    lastMessage={lastMessage}
                    onClick={setActivePeerId}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col rounded-lg border border-border bg-muted/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-sm text-muted-foreground">
              Chatting as{" "}
              <span className="font-mono text-foreground">
                {user?.name}
              </span>
            </div>

            {/* Messages list */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-background/60"
            >
              {!activePeerId ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Select a conversation from the inbox.
                </div>
              ) : loadingMessages && sortedMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Loading messages...
                </div>
              ) : sortedMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Start the conversation!
                </div>
              ) : (
                sortedMessages.map((m) => {
                  const isMine = m.sender === currentUserId;
                  return (
                    <div
                      key={m._id}
                      className={cn(
                        "w-full flex mb-1",
                        isMine ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-3 py-2 rounded-2xl text-sm",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border px-4 py-3 flex gap-3 items-center bg-background">
              <Input
                placeholder={
                  activePeerId
                    ? "Type a message..."
                    : "Select a conversation from the inbox."
                }
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!activePeerId}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!activePeerId || !draft.trim()}
                className="px-6"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
