import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const ROOMS = [
  { id: 'music', label: 'Music', emoji: '🎵', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', tag: 'music' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', tag: 'gaming' },
  { id: 'movies', label: 'Movies', emoji: '🍿', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', tag: 'movies' },
  { id: 'deeptalk', label: 'Deep Talk', emoji: '💬', gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', tag: 'deeptalk' },
  { id: 'language', label: 'Language', emoji: '🌍', gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30', tag: 'language' },
  { id: 'random', label: 'Random', emoji: '✨', gradient: 'from-accent/20 to-cyan/20', border: 'border-accent/30', tag: '' },
];

export function RoomSelector({ selectedRoom, onSelectRoom }) {
  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2 ml-1">
        <span className="text-lg">🏠</span> Pick a Vibe Room
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {ROOMS.map((room) => (
          <motion.button
            key={room.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectRoom(room)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200",
              `bg-gradient-to-br ${room.gradient}`,
              selectedRoom?.id === room.id
                ? `${room.border} shadow-lg ring-1 ring-white/10`
                : "border-white/5 hover:border-white/15"
            )}
          >
            <span className="text-2xl">{room.emoji}</span>
            <span className={cn(
              "text-xs font-semibold",
              selectedRoom?.id === room.id ? "text-white" : "text-white/70"
            )}>{room.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
