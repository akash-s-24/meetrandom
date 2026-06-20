import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic2 } from 'lucide-react';
import { cn } from '../lib/utils';

const VOICE_PRESETS = [
  { id: 'normal', label: 'Normal', emoji: '🎤', desc: 'Your natural voice' },
  { id: 'robot', label: 'Robot', emoji: '🤖', desc: 'Metallic & mechanical' },
  { id: 'chipmunk', label: 'Chipmunk', emoji: '🐿️', desc: 'High-pitched & squeaky' },
  { id: 'deep', label: 'Deep', emoji: '👹', desc: 'Deep & powerful' },
];

export function VideoEffectsPanel({ isOpen, onClose, voicePreset, setVoicePreset }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-lg"
          >
            <div className="glass-panel rounded-t-3xl p-6 pb-10 border-t border-white/10">
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Effects Studio</h3>
                    <p className="text-muted text-xs">Customize your experience</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Voice Changer */}
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎙️</span> Voice Changer
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {VOICE_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setVoicePreset(preset.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left",
                        voicePreset === preset.id
                          ? "bg-accent/20 border-accent/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                          : "bg-surface/50 border-white/5 hover:border-white/15"
                      )}
                    >
                      <span className="text-2xl">{preset.emoji}</span>
                      <div>
                        <p className={cn(
                          "font-semibold text-sm",
                          voicePreset === preset.id ? "text-accent" : "text-white/80"
                        )}>{preset.label}</p>
                        <p className="text-xs text-muted">{preset.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
