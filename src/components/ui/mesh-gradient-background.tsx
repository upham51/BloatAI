import React from 'react';
import { motion } from 'framer-motion';

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
      {/* Blob 1 - Top Left */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${colors.blob1}, transparent 70%)`,
          top: '-10%',
          left: '-10%',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Blob 2 - Top Right */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${colors.blob2}, transparent 70%)`,
          top: '10%',
          right: '-5%',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Blob 3 - Bottom Left */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '550px',
          height: '550px',
          background: `radial-gradient(circle, ${colors.blob3}, transparent 70%)`,
          bottom: '-15%',
          left: '5%',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />

      {/* Blob 4 - Bottom Right */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '480px',
          height: '480px',
          background: `radial-gradient(circle, ${colors.blob4}, transparent 70%)`,
          bottom: '5%',
          right: '-10%',
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
      />

      {/* Center floating blob for extra depth */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '400px',
          background: `radial-gradient(circle, ${colors.blob1}, transparent 80%)`,
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          x: [-20, 20, -20],
          y: [-30, 30, -30],
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
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
