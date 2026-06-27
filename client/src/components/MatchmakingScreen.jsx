import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Earth, X } from 'lucide-react';

const FUN_FACTS = [
  "Did you know? The first webcam was used to monitor a coffee pot.",
  "Over 4 billion people use the internet daily.",
  "Smiling is contagious, even over video chat!",
  "There are over 7,000 languages spoken around the world.",
  "You're one connection away from a new friend."
];

export function MatchmakingScreen({ onCancel, onlineCount }) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl">
      {/* Background Pulse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.3, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="w-64 h-64 rounded-full border-4 border-accent"
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.3, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
          className="absolute w-64 h-64 rounded-full border-4 border-pink"
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.3, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
          className="absolute w-64 h-64 rounded-full border-4 border-cyan"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 glass-panel p-8 rounded-3xl max-w-sm w-full mx-4 border-glow text-center">
        {/* Animated Avatar Spinner */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-dashed border-accent/50"
          />
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent to-pink flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.6)]">
            <Search size={40} className="animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white text-glow">Finding your match...</h2>
          <div className="flex items-center justify-center gap-4 text-muted text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-cyan" /> {onlineCount} online
            </span>
            <span className="flex items-center gap-1.5">
              <Earth size={16} className="text-success" /> Worldwide
            </span>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted/80 italic"
            >
              "{FUN_FACTS[factIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="group flex items-center gap-2 px-6 py-3 rounded-full glass hover:bg-white/10 text-white font-medium transition-all duration-300 hover:text-pink hover:border-pink/50"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Cancel Search
        </button>
      </div>
    </div>
  );
}
