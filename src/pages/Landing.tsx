import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapBackground from "@/components/MapBackground";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MapBackground interactive />
      
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="text-primary">Sub2</span>
            <span className="text-foreground">Lease</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find your perfect sublease or post your apartment with ease. 
            The smart way for UW Madison students to sublease.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all"
            >
              Log In / Sign Up
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/properties")}
              className="text-lg px-8 py-6 border-primary/50 text-primary hover:bg-primary/10 transition-all"
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
