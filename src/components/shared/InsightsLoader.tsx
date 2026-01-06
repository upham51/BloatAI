import React from "react";
import { Sparkles } from "lucide-react";

const InsightsLoader = () => {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      {/* Animated Icon with Glow */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
        </div>

        {/* Center icon */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center backdrop-blur-sm border-2 border-primary/20">
          <Sparkles className="w-12 h-12 text-primary animate-pulse" strokeWidth={1.5} />
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 w-24 h-24 animate-spin-slow">
          <div className="absolute w-3 h-3 rounded-full bg-primary top-0 left-1/2 -translate-x-1/2" />
          <div className="absolute w-2 h-2 rounded-full bg-primary/60 bottom-0 left-1/2 -translate-x-1/2" />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-primary/80 top-1/2 right-0 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};

export default InsightsLoader;
