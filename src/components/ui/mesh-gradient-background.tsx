import React from 'react';

interface MeshGradientBackgroundProps {
  variant?: 'warm' | 'cool' | 'balanced';
}

/**
 * Mesh Gradient Background Component
 * Creates an animated, soft-blurred pastel gradient background with floating color blobs.
 * Inspired by modern iOS/wellness app design aesthetics.
 */
export const MeshGradientBackground: React.FC<MeshGradientBackgroundProps> = ({
  variant = 'balanced'
}) => {
  // Color configurations for different mood variants
  const colorSchemes = {
    warm: {
      blob1: 'rgba(255, 218, 185, 0.6)', // Peach
      blob2: 'rgba(255, 192, 203, 0.5)', // Light pink
      blob3: 'rgba(255, 228, 196, 0.6)', // Bisque
      blob4: 'rgba(250, 214, 195, 0.5)', // Apricot
    },
    cool: {
      blob1: 'rgba(230, 230, 250, 0.6)', // Lavender
      blob2: 'rgba(176, 224, 230, 0.5)', // Powder blue
      blob3: 'rgba(221, 235, 227, 0.6)', // Mint
      blob4: 'rgba(216, 191, 216, 0.5)', // Thistle
    },
    balanced: {
      blob1: 'rgba(255, 218, 185, 0.5)', // Peach
      blob2: 'rgba(230, 230, 250, 0.5)', // Lavender
      blob3: 'rgba(176, 224, 215, 0.5)', // Sage green
      blob4: 'rgba(255, 228, 225, 0.4)', // Misty rose
    },
  };

  const colors = colorSchemes[variant];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-transparent">
      <style>{`
        @keyframes meshBlob1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(30px, 50px, 0) scale(1.1); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes meshBlob2 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-40px, 30px, 0) scale(1.15); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes meshBlob3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -40px, 0) scale(1.2); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes meshBlob4 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-30px, -50px, 0) scale(1.1); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes meshBlobCenter {
          0% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.3; }
          50% { transform: translate3d(calc(-50% + 20px), calc(-50% + 30px), 0) scale(1.15); opacity: 0.5; }
          100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.3; }
        }
      `}</style>
      {/* Blob 1 - Top Left */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${colors.blob1}, transparent 70%)`,
          top: '-10%',
          left: '-10%',
          animation: 'meshBlob1 20s ease-in-out infinite',
          willChange: 'transform',
        }}
      />

      {/* Blob 2 - Top Right */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${colors.blob2}, transparent 70%)`,
          top: '10%',
          right: '-5%',
          animation: 'meshBlob2 18s ease-in-out infinite',
          animationDelay: '2s',
          willChange: 'transform',
        }}
      />

      {/* Blob 3 - Bottom Left */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '550px',
          height: '550px',
          background: `radial-gradient(circle, ${colors.blob3}, transparent 70%)`,
          bottom: '-15%',
          left: '5%',
          animation: 'meshBlob3 22s ease-in-out infinite',
          animationDelay: '4s',
          willChange: 'transform',
        }}
      />

      {/* Blob 4 - Bottom Right */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '480px',
          height: '480px',
          background: `radial-gradient(circle, ${colors.blob4}, transparent 70%)`,
          bottom: '5%',
          right: '-10%',
          animation: 'meshBlob4 25s ease-in-out infinite',
          animationDelay: '6s',
          willChange: 'transform',
        }}
      />

      {/* Center floating blob for extra depth */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${colors.blob1}, transparent 80%)`,
          top: '40%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          animation: 'meshBlobCenter 15s ease-in-out infinite',
          animationDelay: '1s',
          willChange: 'transform, opacity',
        }}
      />

      {/* Subtle grain overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
