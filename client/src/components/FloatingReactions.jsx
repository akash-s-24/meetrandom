import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['❤️', '🔥', '😂', '👏', '😮', '💀', '🎉', '💯'];

function FloatingEmoji({ emoji, id, onComplete }) {
  const randomX = Math.random() * 60 - 30; // -30 to 30
  const randomDuration = 1.5 + Math.random() * 1;

  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
      animate={{
        opacity: [1, 1, 0],
        y: -200 - Math.random() * 100,
        x: randomX,
        scale: [0.5, 1.3, 0.8],
        rotate: Math.random() * 30 - 15,
      }}
      transition={{ duration: randomDuration, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="absolute bottom-20 text-3xl pointer-events-none select-none"
      style={{ left: `${40 + Math.random() * 20}%` }}
    >
      {emoji}
    </motion.div>
  );
}

export function FloatingReactions({ reactions, onRemove }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[55] overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <FloatingEmoji
            key={r.id}
            id={r.id}
            emoji={r.emoji}
            onComplete={() => onRemove(r.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ReactionPicker({ isOpen, onPick, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[60] glass-panel rounded-2xl p-3 flex gap-1 shadow-2xl"
        >
          {EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.3, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPick(emoji)}
              className="text-2xl p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useReactions(socketRef) {
  const [reactions, setReactions] = useState([]);

  const addReaction = useCallback((emoji, fromRemote = false) => {
    const id = Date.now() + Math.random();
    setReactions((prev) => [...prev, { id, emoji }]);

    if (!fromRemote && socketRef?.current) {
      socketRef.current.emit('reaction', emoji);
    }
  }, [socketRef]);

  const removeReaction = useCallback((id) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { reactions, addReaction, removeReaction };
}
