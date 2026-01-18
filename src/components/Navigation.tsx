//main Navbar UI

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import ProfileCard from "@/components/dashboard/ProfileCard";
import { MessagesModal } from "@/components/MessagesModal";

import { LOCAL_STORAGE_USER_KEY, IMAGE_URL } from "../constants";

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(() => getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [inboxOpen, setInboxOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // reload user when auth changes
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

  // click-outside auto-close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLoginClick = () => navigate("/auth");

  const handleLogoutClick = () => {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    window.dispatchEvent(new Event("sub2lease:auth-changed"));
    setMenuOpen(false);
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
          <NavLink to="/" className={linkBase} activeClassName="text-primary">Home</NavLink>
          <NavLink to="/properties" className={linkBase} activeClassName="text-primary">Properties</NavLink>

          {user && (
            <NavLink to="/dashboard" className={linkBase} activeClassName="text-primary">
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Right: login OR profile dropdown */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          {!user && (
            <Button
              size="sm"
              onClick={handleLoginClick}
              className="px-4 bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          )}

          {user && (
            <>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold hover:bg-primary/30 transition"
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-14 z-50 w-80">
                  <ProfileCard
                    user={{
                      id: user._id,
                      name: user.name,
                      email: user.email,
                      avatarUrl: user.profileImage ? IMAGE_URL(user.profileImage) : null,
                    }}
                    loading={loadingProfile}
                    onRefresh={() => setUser(getCurrentUser())}
                    onInbox={() => {
                      setInboxOpen(true);
                      setMenuOpen(false);
                    }}
                    onLogout={handleLogoutClick}
                  />

                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inbox modal */}
      {user && (
        <MessagesModal
          open={inboxOpen}
          onOpenChange={setInboxOpen}
          currentUserId={user._id}
          initialPeerId={undefined}
        />
      )}
    </nav>
  );
};

export default Navigation;
