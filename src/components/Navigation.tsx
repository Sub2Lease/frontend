import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";

import { LOCAL_STORAGE_USER_KEY } from "../constants";

// helper to read the user from localStorage
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => getCurrentUser());

  // listen for login / logout from anywhere in the app
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("sub2lease:auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("sub2lease:auth-changed", handleAuthChange);
    };
  }, []);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleLogoutClick = () => {
    localStorage.removeItem("sub2lease_user");
    window.dispatchEvent(new Event("sub2lease:auth-changed"));
    navigate("/auth", { replace: true });
  };

  const linkBase =
    "text-sm font-medium text-muted-foreground hover:text-primary transition-colors";

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">
            <span className="text-primary">Sub2</span>
            <span className="text-foreground">Lease</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={linkBase}
            activeClassName="text-primary"
          >
            Home
          </NavLink>

          <NavLink
            to="/properties"
            className={linkBase}
            activeClassName="text-primary"
          >
            Properties
          </NavLink>

          {user && (
            <NavLink
              to="/dashboard"
              className={linkBase}
              activeClassName="text-primary"
            >
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Right-side auth button */}
        <div>
          {user ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogoutClick}
              className="px-4"
            >
              Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleLoginClick}
              className="px-4 bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
