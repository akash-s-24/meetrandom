import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Check, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export function AddFriendButton({ state, friendRequested, friendAccepted, onRequest }) {
  if (state !== 'connected') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex"
      >
        {friendAccepted ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-success/20 border border-success/30 rounded-full"
          >
            <Heart className="w-4 h-4 text-success fill-success" />
            <span className="text-sm font-semibold text-success">Connected!</span>
          </motion.div>
        ) : friendRequested ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Request Sent</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRequest}
            className="flex items-center gap-2 px-4 py-2 bg-surface/50 border border-white/10 rounded-full hover:border-accent/30 hover:bg-accent/10 transition-all group"
          >
            <UserPlus className="w-4 h-4 text-white/60 group-hover:text-accent transition-colors" />
            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Add Friend</span>
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function FriendConnectedModal({ isOpen, roomCode, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 30 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative z-10 glass-panel rounded-3xl p-8 max-w-sm w-[90%] text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }}
            className="text-5xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">You're Friends!</h3>
          <p className="text-sm text-muted mb-5">Both of you wanted to connect. Here's your shared room code:</p>
          
          <div className="bg-surface border border-white/10 rounded-2xl p-4 mb-5">
            <p className="text-xs text-muted mb-1">Room Code</p>
            <p className="text-2xl font-mono font-bold text-accent tracking-widest">{roomCode}</p>
          </div>
          
          <p className="text-xs text-muted mb-5">Share this code to reconnect later!</p>
          
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-full font-medium text-sm transition-colors"
          >
            Awesome!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
