import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapBackground from "@/components/MapBackground";

// main page with map and two buttons for login and properties

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MapBackground interactive />

      {/* increased top padding -> content sits lower */}
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
              onClick={() => navigate("/auth")}
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
              Log In / Sign Up
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
