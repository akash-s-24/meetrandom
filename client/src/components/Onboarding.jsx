import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Hash, Users, Sparkles, User, Globe, Activity } from 'lucide-react';
import { RoomSelector } from './RoomSelector';

export function Onboarding({ onStart, onlineCount }) {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  
  const [targetGender, setTargetGender] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  
  const [interest, setInterest] = useState('');
  const [tags, setTags] = useState([]);

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

  const handleStart = () => {
    onStart({
      nickname,
      gender,
      country,
      targetGender,
      targetCountry,
      interests: tags
    });
  };

  return (
    <div className="relative flex min-h-screen p-4 md:p-8 overflow-hidden z-10">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-background overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-pink/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[40%] bg-cyan/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        {/* Left Section: Form & Hero */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col gap-8 w-full max-w-xl pt-10 lg:pt-0"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-glow-pink text-pink font-semibold text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)]"
            >
              <Sparkles className="w-4 h-4" /> The New MeetRandom
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Meet Random <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-accent">
                People Instantly
              </span>
            </h1>
            <p className="text-lg text-muted max-w-md">
              The premium platform to connect with strangers worldwide. Set your preferences and dive into endless conversations.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile setup */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/60 ml-1 uppercase tracking-wider">
                  <User className="w-3 h-3" /> Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/60 ml-1 uppercase tracking-wider">
                  <User className="w-3 h-3" /> I am a...
                </label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/60 ml-1 uppercase tracking-wider">
                  <Globe className="w-3 h-3" /> Looking for
                </label>
                <select 
                  value={targetGender}
                  onChange={(e) => setTargetGender(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink/50 appearance-none"
                >
                  <option value="">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/60 ml-1 uppercase tracking-wider">
                  <Globe className="w-3 h-3" /> From
                </label>
                <select 
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink/50 appearance-none"
                >
                  <option value="">Anywhere</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="in">India</option>
                  <option value="br">Brazil</option>
                  <option value="jp">Japan</option>
                  <option value="kr">South Korea</option>
                  {/* Can add more countries later */}
                </select>
              </div>
            </div>

            <form onSubmit={addTag} className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/60 ml-1 uppercase tracking-wider">
                <Hash className="w-3 h-3" /> Interests
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="anime, gaming, music..."
                  className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-4 pr-16 text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan/10 border border-cyan/20 text-cyan text-xs font-medium"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors ml-1">
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
              onClick={handleStart}
              className="group relative flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-accent to-pink rounded-xl text-white font-bold text-lg shadow-[0_0_30px_rgba(139,92,246,0.5)] overflow-hidden border border-white/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Video className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Matchmaking</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Right Section: Animated Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex-1 hidden lg:flex items-center justify-center relative w-full h-full"
        >
          {/* Stats Cards */}
          <div className="absolute -top-10 -left-10 z-20">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="glass p-4 rounded-2xl flex items-center gap-3 shadow-2xl border-glow"
            >
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <Users className="text-success w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold">Active Users</p>
                <p className="text-xl font-bold text-white">{onlineCount.toLocaleString()}</p>
              </div>
            </motion.div>
          </div>

          <div className="absolute -bottom-10 -right-10 z-20">
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass p-4 rounded-2xl flex items-center gap-3 shadow-2xl border-glow-pink"
            >
              <div className="w-10 h-10 rounded-full bg-pink/20 flex items-center justify-center">
                <Activity className="text-pink w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold">Matches Today</p>
                <p className="text-xl font-bold text-white">12,492</p>
              </div>
            </motion.div>
          </div>

          {/* Fake Video Preview */}
          <div className="relative w-full aspect-[3/4] max-w-md rounded-3xl overflow-hidden glass-panel border-glow shadow-2xl p-2">
            <div className="w-full h-full rounded-2xl bg-surface/80 relative overflow-hidden flex flex-col items-center justify-center">
              
              {/* Dynamic pulse circles */}
              <motion.div
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-32 h-32 rounded-full border border-accent/50"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                className="absolute w-32 h-32 rounded-full border border-cyan/50"
              />
              
              {/* Floating avatars */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: 10 + i * 2, 
                      repeat: Infinity, 
                      ease: "linear",
                      direction: i % 2 === 0 ? "normal" : "reverse"
                    }}
                    className="absolute w-full h-full flex items-start justify-center"
                    style={{ padding: `${30 + i * 15}%` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-pink shadow-lg shadow-pink/30 flex items-center justify-center">
                       <User size={16} className="text-white/80" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 bg-black/40 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-pink animate-pulse shadow-[0_0_10px_#EC4899]"></div>
                <span className="text-white font-medium text-sm tracking-widest uppercase">Live Demo</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
