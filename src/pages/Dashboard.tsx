import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MapPin, Heart, FileText, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Dashboard = () => {
  const [isPostingLease, setIsPostingLease] = useState(false);

  // Mock data
  const userProfile = {
    name: "John Badger",
    email: "john@wisc.edu",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  };

  const postedLeases = [
    {
      id: 1,
      title: "Modern Studio Near Campus",
      price: 850,
      status: "Active",
      views: 45,
    },
  ];

  const savedProperties = [
    {
      id: 1,
      title: "Cozy 2BR Apartment",
      price: 650,
      address: "456 Johnson St",
    },
    {
      id: 2,
      title: "Spacious 1BR with View",
      price: 750,
      address: "789 University Ave",
    },
  ];

  const paymentHistory = [
    {
      id: 1,
      date: "2024-12-15",
      amount: 850,
      status: "Completed",
      property: "Modern Studio Near Campus",
    },
    {
      id: 2,
      date: "2024-11-15",
      amount: 850,
      status: "Completed",
      property: "Modern Studio Near Campus",
    },
  ];

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
                  Fill in the details about your property. Your listing will appear on the map once submitted.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input id="title" placeholder="Modern Studio Near Campus" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Month</Label>
                    <Input id="price" type="number" placeholder="850" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="roommates">Number of Roommates</Label>
                    <Input id="roommates" type="number" placeholder="0" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 State St, Madison, WI" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">Available From</Label>
                    <Input id="from" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="to">Available To</Label>
                    <Input id="to" type="date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Input id="amenities" placeholder="WiFi, Parking, Laundry" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your property..."
                    rows={4}
                  />
                </div>
                
                <Button className="w-full" onClick={() => setIsPostingLease(false)}>
                  Submit Listing
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
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback>JB</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">Edit Profile</Button>
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
              <div className="space-y-4">
                {postedLeases.map((lease) => (
                  <div
                    key={lease.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold">{lease.title}</h4>
                      <p className="text-sm text-muted-foreground">${lease.price}/mo</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{lease.status}</Badge>
                      <div className="text-sm text-muted-foreground">{lease.views} views</div>
                    </div>
                  </div>
                ))}
              </div>
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
                    <div className="text-lg font-bold text-primary">${property.price}/mo</div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 border border-border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">${payment.amount}</span>
                      <Badge variant="outline" className="text-xs">
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
