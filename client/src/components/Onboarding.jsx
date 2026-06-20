import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Hash, Users, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { RoomSelector } from './RoomSelector';

export function Onboarding({ onStart, onlineCount }) {
  const [interest, setInterest] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const addTag = (e) => {
    e.preventDefault();
    const val = interest.trim().toLowerCase();
    if (val && !tags.includes(val) && tags.length < 5) {
      setTags([...tags, val]);
      setInterest('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    // Add room tag if it doesn't exist
    if (room.tag && !tags.includes(room.tag)) {
      setTags(prev => [...prev.filter(t => {
        // Remove previously selected room tags
        const roomTags = ['music', 'gaming', 'movies', 'deeptalk', 'language'];
        return !roomTags.includes(t);
      }), room.tag].slice(0, 5));
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 z-10">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-success/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-10 md:p-14 rounded-3xl max-w-2xl w-full text-center relative z-10"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 text-accent mb-8 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
          MeetRandom
        </h1>
        <p className="text-lg md:text-xl text-muted mb-8 max-w-lg mx-auto leading-relaxed">
          The next-gen social platform to meet fascinating people instantly. No accounts, pure vibes.
        </p>

        {/* Room Selector */}
        <div className="mb-8 max-w-md mx-auto">
          <RoomSelector selectedRoom={selectedRoom} onSelectRoom={handleRoomSelect} />
        </div>

        <form onSubmit={addTag} className="mb-8 text-left max-w-md mx-auto">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-3 ml-1">
            <Hash className="w-4 h-4 text-accent" />
            Add your vibes (optional)
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="gaming, music, anime..."
              className="w-full bg-surface/50 border border-white/10 rounded-2xl py-4 pl-5 pr-20 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                    &times;
                  </button>
                </motion.span>
              ))}
            </div>
          )}
        </form>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(tags)}
          className="group relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accent to-cyan rounded-2xl text-white font-bold text-lg shadow-[0_0_40px_rgba(139,92,246,0.4)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Video className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Start Exploring</span>
        </motion.button>

      </motion.div>

      {/* Online indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-muted"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success shadow-[0_0_8px_#10B981]"></span>
        </span>
        {onlineCount} users matching vibes
      </motion.div>
    </div>
  );
}
