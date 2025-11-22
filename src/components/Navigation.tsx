import { Link, useLocation } from "react-router-dom";
import { Home, MapPin, User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-primary">Sub2</span>
            <span className="text-foreground">Lease</span>
          </Link>
          
          <div className="flex items-center gap-8">
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
            
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
