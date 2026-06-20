import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

const SKIP_REASONS = [
  { id: 'inappropriate', label: 'Inappropriate', emoji: '🚫', color: 'text-red-400' },
  { id: 'not-interested', label: 'Not interested', emoji: '😐', color: 'text-muted' },
  { id: 'afk', label: 'AFK / No camera', emoji: '👻', color: 'text-amber-400' },
  { id: 'browsing', label: 'Just browsing', emoji: '👀', color: 'text-cyan' },
];

export function SkipReasonModal({ isOpen, onSelect, onSkip }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onSkip(null)} />
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative z-10 glass-panel rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full sm:w-[90%]"
        >
          <div className="flex justify-center mb-3 sm:hidden">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold text-lg">Why are you skipping?</h3>
            <button onClick={() => onSkip(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          <p className="text-xs text-muted mb-4">This helps us improve your matches (optional)</p>

          <div className="grid gap-2 mb-4">
            {SKIP_REASONS.map((reason) => (
              <motion.button
                key={reason.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(reason.id)}
                className="flex items-center gap-3 p-3.5 bg-surface/50 border border-white/5 rounded-2xl hover:border-white/15 transition-all text-left"
              >
                <span className="text-xl">{reason.emoji}</span>
                <span className={cn("font-medium text-sm", reason.color)}>{reason.label}</span>
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => onSkip(null)}
            className="w-full py-3 text-sm text-muted hover:text-white transition-colors font-medium"
          >
            Skip without reason
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
