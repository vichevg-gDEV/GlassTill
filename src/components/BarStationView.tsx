import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wine, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Lock, 
  Sparkles, 
  Filter, 
  CheckCheck,
  RotateCcw,
  ArrowRight,
  Flame
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { StationTicket } from '../types';

export const BarStationView: React.FC = () => {
  const { 
    stationTickets, 
    updateStationTicketStatus, 
    replyToStationTicket, 
    lockTill, 
    currentUser, 
    playAudioFeedback,
    switchTab,
    settings
  } = usePOS();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [selectedTicketForReply, setSelectedTicketForReply] = useState<StationTicket | null>(null);
  const [customReplyText, setCustomReplyText] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter only bar tickets
  const barTickets = stationTickets.filter(t => t.station === 'bar');
  
  const filteredTickets = barTickets.filter(ticket => {
    if (activeFilter === 'all') return ticket.status !== 'completed';
    return ticket.status === activeFilter;
  });

  const pendingCount = barTickets.filter(t => t.status === 'pending').length;
  const preparingCount = barTickets.filter(t => t.status === 'preparing').length;
  const readyCount = barTickets.filter(t => t.status === 'ready').length;

  const quickReplyPresets = [
    'Shaking & Stirring • 2-3 mins',
    'Wine decanted & ready at pickup!',
    'Draft beers poured & cold',
    'Out of spirit brand • Checking alternatives with server',
    'Cocktails at Bar Pass!'
  ];

  const handleSendReply = (ticketId: string, message: string, newStatus?: 'preparing' | 'ready') => {
    if (!message.trim()) return;
    replyToStationTicket(ticketId, message.trim(), newStatus);
    setSelectedTicketForReply(null);
    setCustomReplyText('');
  };

  const getElapsedMinutes = (dateString: string) => {
    return Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-zinc-950 text-white font-['Inter',sans-serif]">
      {/* Top Station Header - Touch Sized */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-zinc-800 bg-[#121215] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Wine className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Bar Display System</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                BDS Bar
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Live Mixology & Drink Dispatch • {settings.venueName}
            </p>
          </div>
        </div>

        {/* Status Count Badges & Controls - Touch Sized */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
            <button
              onClick={() => setActiveFilter('all')}
              className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === 'all' ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Active ({pendingCount + preparingCount + readyCount})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'pending' ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('preparing')}
              className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'preparing' ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wine className="w-4 h-4 text-cyan-400" />
              <span>Pouring ({preparingCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('ready')}
              className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                activeFilter === 'ready' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ready ({readyCount})</span>
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden md:block" />

          {/* Clock */}
          <div className="h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>{currentTime}</span>
          </div>

          {/* Switch to Floor / FOH (if admin/manager) */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button
              onClick={() => switchTab('tables')}
              className="h-11 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-2"
              title="Return to Main POS Floor"
            >
              <span>Floor POS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Lock Station */}
          <button
            onClick={lockTill}
            className="h-11 px-4 rounded-xl bg-zinc-900 hover:bg-rose-500/20 border border-zinc-800 hover:border-rose-500/30 text-xs sm:text-sm font-bold text-zinc-300 hover:text-rose-200 flex items-center gap-2 transition-all shadow-sm"
            title="Lock Station PIN"
          >
            <Lock className="w-4 h-4" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Ticket Deck */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredTickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-cyan-400 shadow-inner">
              <Wine className="w-10 h-10 stroke-1" />
            </div>
            <h2 className="text-xl font-bold text-zinc-200">Bar Queue is Clear</h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-md">
              No pending drink orders. Drinks submitted from floor tables will appear here with live notifications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredTickets.map(ticket => {
              const elapsed = getElapsedMinutes(ticket.submittedAt);
              const isUrgent = elapsed >= 10;
              const isWarning = elapsed >= 5 && elapsed < 10;

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-200 shadow-xl ${
                    ticket.status === 'ready'
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : ticket.status === 'preparing'
                      ? 'border-cyan-500/50 bg-cyan-950/20'
                      : isUrgent
                      ? 'border-rose-500/60 bg-rose-950/25 ring-1 ring-rose-500/40'
                      : 'border-zinc-800 bg-[#151518]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3.5 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            ticket.status === 'ready'
                              ? 'bg-emerald-400'
                              : ticket.status === 'preparing'
                              ? 'bg-cyan-400 animate-pulse'
                              : 'bg-rose-400'
                          }`} />
                          <h2 className="font-bold text-lg text-white">
                            {ticket.tableName}
                          </h2>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          Server: {ticket.serverName || 'Staff'}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                          isUrgent
                            ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                            : isWarning
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{elapsed === 0 ? 'Just now' : `${elapsed}m`}</span>
                        </span>

                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${
                          ticket.status === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : ticket.status === 'preparing'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {ticket.status === 'preparing' ? 'Pouring' : ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Drink Items List */}
                    <div className="py-4 space-y-3.5">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm sm:text-base">
                          <span className="font-mono font-bold text-zinc-950 bg-cyan-400 px-2.5 py-1 rounded-xl text-xs sm:text-sm shrink-0 shadow-sm">
                            {item.quantity}×
                          </span>
                          <div className="flex-1">
                            <span className="font-bold text-white leading-snug">
                              {item.name}
                            </span>
                            {item.note && (
                              <p className="text-xs text-cyan-300 font-mono mt-1 bg-cyan-400/10 px-2.5 py-1 rounded-lg border border-cyan-400/25 font-semibold">
                                ↳ {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Previous Station Reply / Notice */}
                    {ticket.replyMessage && (
                      <div className="mb-4 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-0.5">
                          <MessageSquare className="w-4 h-4" />
                          <span>Bar Note Sent:</span>
                        </div>
                        <p className="text-zinc-200 font-medium">{ticket.replyMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status Controls - Large Touch Targets */}
                  <div className="pt-3.5 border-t border-zinc-800 space-y-2">
                    <div className="grid grid-cols-2 gap-2.5">
                      {ticket.status === 'pending' && (
                        <button
                          id={`bar-start-${ticket.id}`}
                          onClick={() => {
                            updateStationTicketStatus(ticket.id, 'preparing');
                            replyToStationTicket(ticket.id, 'Bartender started mixing drinks');
                          }}
                          className="col-span-2 h-12 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                          <Wine className="w-4 h-4" />
                          <span>Start Pouring / Mixing</span>
                        </button>
                      )}

                      {ticket.status === 'preparing' && (
                        <>
                          <button
                            id={`bar-reply-btn-${ticket.id}`}
                            onClick={() => setSelectedTicketForReply(ticket)}
                            className="h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <span>Reply / ETA</span>
                          </button>

                          <button
                            id={`bar-ready-${ticket.id}`}
                            onClick={() => {
                              updateStationTicketStatus(ticket.id, 'ready');
                              replyToStationTicket(ticket.id, 'Drinks Poured & Ready at Bar Mat!');
                              playAudioFeedback('bell');
                            }}
                            className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Drinks Ready</span>
                          </button>
                        </>
                      )}

                      {ticket.status === 'ready' && (
                        <>
                          <button
                            id={`bar-reply-ready-${ticket.id}`}
                            onClick={() => setSelectedTicketForReply(ticket)}
                            className="h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Note</span>
                          </button>

                          <button
                            id={`bar-complete-${ticket.id}`}
                            onClick={() => updateStationTicketStatus(ticket.id, 'completed')}
                            className="h-12 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer"
                          >
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            <span>Served / Clear</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedTicketForReply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#18181c] rounded-3xl p-6 border border-zinc-700 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Wine className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Send Bar Update to {selectedTicketForReply.tableName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTicketForReply(null)}
                  className="h-10 px-3.5 rounded-xl bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider font-semibold">Quick Presets</span>
                <div className="flex flex-col gap-2">
                  {quickReplyPresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => handleSendReply(selectedTicketForReply.id, preset)}
                      className="w-full text-left p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs sm:text-sm text-zinc-200 hover:text-white transition-all font-medium"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message input */}
              <div className="pt-2">
                <label className="text-xs text-zinc-400 block mb-1.5 font-mono uppercase tracking-wider font-semibold">
                  Custom Status Message
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Type message to server..."
                    value={customReplyText}
                    onChange={e => setCustomReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customReplyText) {
                        handleSendReply(selectedTicketForReply.id, customReplyText);
                      }
                    }}
                    className="flex-1 h-12 rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => handleSendReply(selectedTicketForReply.id, customReplyText)}
                    disabled={!customReplyText.trim()}
                    className="h-12 px-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
