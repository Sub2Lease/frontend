import { useEffect, useState } from "react";

interface Pin {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

const MapBackground = ({ interactive = false }: { interactive?: boolean }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [pins, setPins] = useState<Pin[]>([]);

  useEffect(() => {
    // Generate random pins
    const generatedPins: Pin[] = [];
    for (let i = 0; i < 15; i++) {
      generatedPins.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random(),
      });
    }
    setPins(generatedPins);

    // Animate pin opacity
    const interval = setInterval(() => {
      setPins((currentPins) =>
        currentPins.map((pin) => ({
          ...pin,
          opacity: Math.random() * 0.7 + 0.3,
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePosition({
      x: (clientX - innerWidth / 2) / 50,
      y: (clientY - innerHeight / 2) / 50,
    });
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />

      {/* Campus buildings representation */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-card border border-border/30"
            style={{
              left: `${15 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 30}%`,
              width: `${60 + Math.random() * 40}px`,
              height: `${40 + Math.random() * 60}px`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* Sublease pins */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {pins.map((pin) => (
          <div
            key={pin.id}
            className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary))]"
            style={{
              left: `${pin.x}%`,
              top: `${pin.y}%`,
              opacity: pin.opacity,
              transition: "opacity 2s ease-in-out",
            }}
          >
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse-glow" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapBackground;
