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
        className="relative overflow-hidden rounded-[2rem] shadow-xl cursor-pointer group"
      >
        {/* Clean white card */}
        <div className="relative bg-white border border-border/40 rounded-[2rem] group-hover:bg-gray-50/80 transition-all duration-500">
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border-2 border-white/80 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0"
              >
                <BookOpen className="w-7 h-7 text-sky-600" strokeWidth={2.5} />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-foreground tracking-tight" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                  Why This Keeps Happening
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-medium leading-relaxed">
                  Understand what's going on in your gut and what you can do about it. You're not alone in this.
                </p>
              </div>

              {/* Arrow */}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border-2 border-white/80 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-sky-500 group-hover:to-blue-500 transition-all duration-300"
              >
                <ArrowRight className="w-5 h-5 text-sky-600 group-hover:text-white transition-colors" strokeWidth={2.5} />
              </motion.div>
            </div>

            {/* CTA text */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-border/30"
            >
              <p className="text-sm font-bold text-sky-600 group-hover:text-sky-700 transition-colors flex items-center gap-2">
                <span>Learn more about your body</span>
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
