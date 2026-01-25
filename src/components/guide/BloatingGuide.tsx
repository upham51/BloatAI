import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { BloatingGuideModal } from './BloatingGuideModal';

export function BloatingGuide() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-pink-500/10 cursor-pointer group"
      >
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/80 via-rose-100/70 to-purple-100/80" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-pink-400/25 to-rose-400/20 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
            y: [0, 15, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-purple-400/20 to-violet-300/15 rounded-full blur-3xl"
        />

        {/* Premium glass overlay */}
        <div className="relative backdrop-blur-2xl bg-white/60 border-2 border-white/80 rounded-[2rem] group-hover:bg-white/70 transition-all duration-500">
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-pink-500/20 flex-shrink-0"
              >
                <BookOpen className="w-7 h-7 text-pink-600" strokeWidth={2.5} />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-foreground tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                  The Complete Guide to Bloating
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-medium leading-relaxed">
                  Feeling like you have a balloon in your belly after eating? You're not alone. Learn what causes bloating and how to manage it.
                </p>
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-2 border-white/80 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-rose-500 transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* CTA text */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-white/50"
            >
              <p className="text-sm font-bold text-pink-600 group-hover:text-pink-700 transition-colors flex items-center gap-2">
                <span>Tap to read the complete guide</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <BloatingGuideModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
