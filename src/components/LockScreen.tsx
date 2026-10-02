import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, User, Sparkles, Delete, ArrowRight, ChefHat, Wine } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const LockScreen: React.FC = () => {
  const { unlockWithPin, profiles, settings, playAudioFeedback } = usePOS();
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 5) {
      const nextPin = pin + digit;
      setPin(nextPin);
      playAudioFeedback('tap');

      if (nextPin.length === 5) {
        // Evaluate PIN immediately
        const success = unlockWithPin(nextPin);
        if (!success) {
          setIsError(true);
          setTimeout(() => {
            setPin('');
            setIsError(false);
          }, 450);
        }
      }
    }
  }, [pin, unlockWithPin, playAudioFeedback]);

  const handleDelete = useCallback(() => {
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
      playAudioFeedback('tap');
    }
  }, [pin, playAudioFeedback]);

  const handleClear = useCallback(() => {
    setPin('');
    setIsError(false);
    playAudioFeedback('tap');
  }, [playAudioFeedback]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete, handleClear]);

  const quickSwitch = (targetPin: string) => {
    setPin(targetPin);
    const success = unlockWithPin(targetPin);
    if (!success) {
      setIsError(true);
      setTimeout(() => {
        setPin('');
        setIsError(false);
      }, 450);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/80 select-none p-4 font-['Inter',sans-serif]"
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Venue Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LUMATILL OS • {settings.venueName.toUpperCase()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Enter Access PIN</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">Tap your 5-digit station or staff code to access till</p>
        </div>

        {/* 5-Digit PIN Dot Indicators */}
        <div 
          className={`flex items-center justify-center gap-4 mb-7 py-3 px-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 transition-all ${
            isError ? 'animate-shake border-rose-500/50 bg-rose-500/10' : ''
          }`}
        >
          {[0, 1, 2, 3, 4].map(idx => {
            const isFilled = idx < pin.length;
            return (
              <motion.div
                key={idx}
                animate={{
                  scale: isFilled ? 1.2 : 1,
                  borderColor: isError ? '#ef4444' : isFilled ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                  backgroundColor: isError ? '#ef4444' : isFilled ? '#fbbf24' : 'transparent',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="w-4 h-4 rounded-full border-2 transition-colors"
              />
            );
          })}
        </div>

        {/* Touch Number Pad - Large Touch Keypad (80px button height) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              id={`pin-key-${num}`}
              onClick={() => handleDigit(num.toString())}
              className="h-20 rounded-2xl bg-[#18181c] border border-zinc-800 hover:border-zinc-700 text-3xl font-light text-white flex items-center justify-center transition-all duration-100 active:scale-90 active:bg-amber-400/20 active:border-amber-400 hover:bg-[#202026] shadow-md cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Bottom Row: Clear, 0, Backspace */}
          <button
            id="pin-key-clear"
            onClick={handleClear}
            className="h-20 rounded-2xl bg-[#18181c] border border-zinc-800 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-center transition-all duration-100 active:scale-90 hover:text-white hover:bg-[#202026] shadow-md cursor-pointer"
          >
            Clear
          </button>

          <button
            id="pin-key-0"
            onClick={() => handleDigit('0')}
            className="h-20 rounded-2xl bg-[#18181c] border border-zinc-800 text-3xl font-light text-white flex items-center justify-center transition-all duration-100 active:scale-90 active:bg-amber-400/20 active:border-amber-400 hover:bg-[#202026] shadow-md cursor-pointer"
          >
            0
          </button>

          <button
            id="pin-key-backspace"
            onClick={handleDelete}
            className="h-20 rounded-2xl bg-[#18181c] border border-zinc-800 text-zinc-400 flex items-center justify-center transition-all duration-100 active:scale-90 hover:text-white hover:bg-[#202026] shadow-md cursor-pointer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Fast Role Demo Switcher - Touch Sized Pills */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 w-full text-center">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3 font-semibold">
            Quick Test Accounts (Stations & Staff)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {profiles.map(profile => {
              const isKitchen = profile.role === 'kitchen';
              const isBar = profile.role === 'bar';
              const isAdmin = profile.role === 'admin';
              const isMgr = profile.role === 'manager';

              return (
                <button
                  key={profile.id}
                  id={`quick-login-${profile.role}-${profile.pin}`}
                  onClick={() => quickSwitch(profile.pin)}
                  className={`h-11 px-3.5 rounded-xl text-xs hover:text-white flex items-center gap-2 transition-all text-left cursor-pointer border shadow-sm ${
                    isKitchen ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' :
                    isBar ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20' :
                    isAdmin ? 'bg-amber-400/10 border-amber-400/30 text-amber-200 hover:bg-amber-400/20 font-semibold' :
                    'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {isKitchen && <ChefHat className="w-3.5 h-3.5 text-amber-400" />}
                  {isBar && <Wine className="w-3.5 h-3.5 text-cyan-400" />}
                  {!isKitchen && !isBar && (
                    <span className={`w-2 h-2 rounded-full ${
                      isAdmin ? 'bg-amber-400' :
                      isMgr ? 'bg-blue-400' : 'bg-emerald-400'
                    }`} />
                  )}
                  <span className="font-semibold">{profile.displayName.replace(' Display KDS', '')}</span>
                  <span className="text-[11px] opacity-70 font-mono">({profile.pin})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
