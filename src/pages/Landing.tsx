// src/pages/Landing.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InteractiveMap from "@/components/InteractiveMap";

const Landing = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // background map offset (in px)
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sub2lease_user");
      setIsLoggedIn(!!raw);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const MAX_X = 50 * 2;
    const MAX_Y = 50 * 2;

    let x = 0;
    let y = 0;
    let dx = 0.3 * 3;
    let dy = 0.1 * 4;

    const id = window.setInterval(() => {
      x += dx;
      y += dy;

      if (x > MAX_X || x < -MAX_X) {
        dx = -dx;
        x += dx;
      }
      if (y > MAX_Y || y < -MAX_Y) {
        dy = -dy;
        y += dy;
      }

      setMapOffset({ x, y });
    }, 16);

    return () => window.clearInterval(id);
  }, []);

  const handlePrimaryClick = () => {
    if (isLoggedIn) {
      try {
        localStorage.removeItem("sub2lease_user");
      } catch {
        // ignore
      }
      navigate("/auth", { replace: true });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full-screen animated map background */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div
          className="absolute -inset-12"
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(1.25)`,
            transition: "transform 0.16s linear",
          }}
        >
          <InteractiveMap variant="background" />
        </div>
      </div>

      {/* Dark gradient overlay so copy stays readable */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-6 pt-36 md:pt-40 lg:pt-48 pb-20">
        <div
          className="
            max-w-5xl mx-auto text-center 
            space-y-8 lg:space-y-10 
            animate-fade-in
            md:scale-100 lg:scale-110
            origin-center
          "
        >
          <h1 className="font-bold tracking-tight text-4xl md:text-6xl lg:text-7xl">
            <span className="text-primary">Sub2</span>
            <span className="text-foreground">Lease</span>
          </h1>

          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Find your perfect sublease or post your apartment with ease.
            The smart way for UW Madison students to sublease.
          </p>

          <div className="flex items-center justify-center gap-5 pt-4">
            <Button
              size="lg"
              onClick={handlePrimaryClick}
              className="
                text-base md:text-lg
                px-9 md:px-10 
                py-5 md:py-6
                bg-primary hover:bg-primary/90 
                shadow-[0_0_20px_hsl(var(--primary)/0.3)]
                hover:shadow-[0_0_26px_hsl(var(--primary)/0.5)]
                transition-all
              "
            >
              {isLoggedIn ? "Logout" : "Log In / Sign Up"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/properties")}
              className="
                text-base md:text-lg
                px-9 md:px-10 
                py-5 md:py-6
                border-primary/60 text-primary 
                hover:bg-primary/10 
                transition-all
              "
            >
              Find Properties
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
