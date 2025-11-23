// src/components/dashboard/PostLeaseDialog.tsx
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { API_BASE } from "@/constants";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ownerId: string | undefined;
  onCreated: () => void;
}

const PostLeaseDialog = ({ open, onOpenChange, ownerId, onCreated }: Props) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    roommates: "",
    address: "",
    from: "",
    to: "",
    amenities: "",
    description: "",
  });

  const submit = async () => {
    if (!ownerId) return;

    setLoading(true);

    await fetch(`${API_BASE}/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: ownerId,
        title: form.title,
        address: form.address,
        rent: Number(form.price),
        capacity: Number(form.roommates || 1),
        startDate: form.from,
        endDate: form.to,
        amenities: form.amenities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        description: form.description,
      }),
    });

    setLoading(false);
    setForm({
      title: "",
      price: "",
      roommates: "",
      address: "",
      from: "",
      to: "",
      amenities: "",
      description: "",
    });

    onCreated();
    onOpenChange(false);
  };

  const update = (field: string, v: string) =>
    setForm((p) => ({ ...p, [field]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            Fill in the details about your property.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Property Title</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price per Month</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Roommates</Label>
              <Input
                type="number"
                value={form.roommates}
                onChange={(e) => update("roommates", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Available From</Label>
              <Input
                type="date"
                value={form.from}
                onChange={(e) => update("from", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Available To</Label>
              <Input
                type="date"
                value={form.to}
                onChange={(e) => update("to", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities (comma separated)</Label>
            <Input
              value={form.amenities}
              onChange={(e) => update("amenities", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? "Posting..." : "Submit Listing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostLeaseDialog;
