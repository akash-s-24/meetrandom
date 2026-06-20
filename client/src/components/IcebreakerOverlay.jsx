import { motion, AnimatePresence } from 'framer-motion';
import { Dice6, X } from 'lucide-react';

const ICEBREAKERS = [
  "If you could have dinner with any person, alive or dead, who would it be? 🍽️",
  "What's the most spontaneous thing you've ever done? ⚡",
  "What's a skill you'd love to master overnight? 🎯",
  "If you had to live in a different country, where would you go? 🌍",
  "What's the best movie you've seen this year? 🎬",
  "Do you believe in aliens? 👽",
  "What's your most unpopular opinion? 🔥",
  "If you could time travel, would you go to the past or future? ⏰",
  "What's the last song you had on repeat? 🎵",
  "If you won the lottery tomorrow, what's the first thing you'd do? 💰",
  "What's the weirdest food you've ever tried? 🍜",
  "Are you a morning person or a night owl? 🌙",
  "What's your biggest flex right now? 💪",
  "If your life was a movie, what genre would it be? 🎭",
  "What's the best compliment you've ever received? ✨",
  "Do you have a hidden talent? 🎪",
  "What's your go-to comfort show? 📺",
  "If you could swap lives with anyone for a day, who? 🔄",
  "What's the most adventurous thing on your bucket list? 🪂",
  "Cats or dogs? And why? 🐱🐶",
  "What's a conspiracy theory you low-key believe? 🤔",
  "If you could only eat one cuisine for the rest of your life? 🍕",
  "What's something you changed your mind about recently? 💭",
  "What's the best advice someone ever gave you? 📖",
  "If you could instantly learn any language, which one? 🗣️",
  "What's your toxic trait? Be honest 😈",
  "Beach vacation or mountain adventure? ⛰️🏖️",
  "What's the app you spend the most time on? 📱",
  "If you had a theme song that played every time you entered a room? 🎶",
  "What's a hill you'd die on? ⚔️",
  "What's the most useless fact you know? 🧠",
  "If you could have any superpower but only for 24 hours? 🦸",
  "What's your love language? 💕",
  "Are you team early bird or team snooze button? ⏰",
  "What's the best concert or event you've been to? 🎤",
  "If you could master any instrument overnight? 🎸",
  "What's your 3 AM thought? 🌃",
  "Truth or dare? And why? 😏",
  "What's a trend you never understood? 🤷",
  "If your pet could talk, what would they say about you? 🐾",
  "What's your signature dish to cook? 👨‍🍳",
  "Describe your aesthetic in 3 words ✨",
  "What's the best purchase you've ever made? 🛍️",
  "If you could teleport anywhere right now? 🌀",
  "What's a song that always makes you emotional? 🥹",
  "What era would you love to visit? 🏛️",
  "What's your Roman Empire? (thing you think about constantly) 🏟️",
  "If you could collab with any creator, who? 🤝",
  "What's the most random thing in your search history? 🔍",
  "What would you name your autobiography? 📚",
];

let lastIndex = -1;

function getRandomQuestion() {
  let idx;
  do {
    idx = Math.floor(Math.random() * ICEBREAKERS.length);
  } while (idx === lastIndex && ICEBREAKERS.length > 1);
  lastIndex = idx;
  return ICEBREAKERS[idx];
}

export function IcebreakerOverlay({ question, onClose }) {
  if (!question) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[65] max-w-md w-[90%]"
      >
        <div className="glass-panel rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-cyan to-success" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>

          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/30 to-cyan/30 border border-accent/20 mb-5"
          >
            <Dice6 className="w-7 h-7 text-accent" />
          </motion.div>

          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Icebreaker</h3>
          
          <p className="text-xl font-semibold text-white leading-relaxed mb-6">
            {question}
          </p>

          <p className="text-xs text-muted">Both of you can see this question ✨</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { getRandomQuestion };
