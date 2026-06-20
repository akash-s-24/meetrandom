import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Dice6 } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChatPanel({ messages, onSend, onChange, isTyping, state, onIcebreaker }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && state === 'connected') {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-[24px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">Live Chat</h3>
        <div className="flex items-center gap-3">
          {/* Icebreaker Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onIcebreaker}
            disabled={state !== 'connected'}
            title="Random Icebreaker"
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              state === 'connected' 
                ? "hover:bg-accent/20 text-accent cursor-pointer" 
                : "text-muted/30 cursor-not-allowed"
            )}
          >
            <Dice6 className="w-5 h-5" />
          </motion.button>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", state === 'connected' ? "bg-success shadow-[0_0_8px_#10B981]" : "bg-muted")} />
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              {state === 'connected' ? 'Connected' : state === 'searching' ? 'Searching' : 'Idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Log */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm",
                msg.type === 'system' 
                  ? "mx-auto bg-white/5 text-muted text-center text-sm font-medium border border-white/5" 
                  : msg.type === 'icebreaker'
                    ? "mx-auto bg-gradient-to-r from-accent/10 to-cyan/10 text-white text-center text-sm font-medium border border-accent/20 max-w-[95%]"
                    : msg.from === 'you'
                      ? "ml-auto bg-gradient-to-br from-accent to-accent/80 text-white rounded-br-sm"
                      : "mr-auto bg-surface border border-white/5 text-white/90 rounded-bl-sm"
              )}
            >
              {msg.type === 'icebreaker' && <span className="text-accent mr-1">🎲</span>}
              {msg.text}
            </motion.div>
          ))}
          {isTyping && (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mr-auto bg-surface border border-white/5 text-white/60 rounded-2xl rounded-bl-sm px-5 py-4 max-w-[85%]"
            >
              <div className="flex gap-1.5 items-center h-2">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface/30 backdrop-blur-md border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onChange(e.target.value);
            }}
            disabled={state !== 'connected'}
            placeholder={state === 'connected' ? "Message..." : "Waiting for connection..."}
            className="w-full bg-surface border border-white/10 rounded-full py-3.5 pl-5 pr-24 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-inner disabled:opacity-50"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button type="button" className="p-2 text-muted hover:text-white transition-colors" disabled={state !== 'connected'}>
              <Smile className="w-5 h-5" />
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || state !== 'connected'}
              className="p-2 bg-accent hover:bg-accent/80 text-white rounded-full transition-all disabled:opacity-50 disabled:hover:bg-accent"
            >
              <Send className="w-4 h-4 ml-px mt-px" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
