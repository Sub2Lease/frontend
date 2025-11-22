import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, MapPin, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-primary">Sub2</span>
            <span className="text-foreground">Lease</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
            
            <Link
              to="/properties"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/properties") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Properties</span>
            </Link>
            
            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 transition-colors ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
          </div>
          
          {/* Auth Button */}
          <div className="hidden md:block">
            {user ? (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90"
              >
                Login
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 py-2 transition-colors ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
            
            <Link
              to="/properties"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2 py-2 transition-colors ${
                isActive("/properties") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">Properties</span>
            </Link>
            
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 py-2 transition-colors ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}
            
            {user ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="border-primary/50 text-primary hover:bg-primary/10 w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => {
                  navigate("/auth");
                  setIsOpen(false);
                }}
                className="bg-primary hover:bg-primary/90 w-full"
              >
                Login
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
