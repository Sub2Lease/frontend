import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import MapBackground from "@/components/MapBackground";

const API_BASE = "https://sub2leasebackend.onrender.com";

async function parseMaybeJson(res: Response) {
  const text = await res.text();
  try {
    return { data: text ? JSON.parse(text) : null, raw: text };
  } catch {
    return { data: null, raw: text };
  }
}

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  const notifyAuthChanged = () => {
    window.dispatchEvent(new Event("sub2lease:auth-changed"));
  };

  const goToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const { data, raw } = await parseMaybeJson(res);

      if (!res.ok) {
        const msg =
          (data && (data as any).error) ||
          raw ||
          "Invalid email or password";
        toast.error(msg);
        console.error("Login failed:", raw);
        return;
      }

      localStorage.setItem("sub2lease_user", JSON.stringify(data));
      notifyAuthChanged();
      toast.success("Logged in successfully!");
      goToDashboard();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupFullName,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      const { data, raw } = await parseMaybeJson(res);

      if (!res.ok) {
        const msg =
          (data && (data as any).error) ||
          raw ||
          "Failed to create account";
        toast.error(msg);
        console.error("Signup failed:", raw);
        return;
      }

      localStorage.setItem("sub2lease_user", JSON.stringify(data));
      notifyAuthChanged();
      toast.success("Account created! Logged in.");
      goToDashboard();
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MapBackground interactive />

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              <span className="text-primary">Sub2</span>
              <span className="text-foreground">Lease</span>
            </CardTitle>
            <CardDescription className="text-center">
              Join the UW Madison sublease community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@wisc.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@wisc.edu"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
