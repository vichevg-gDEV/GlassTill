import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Wine, 
  Clock, 
  CheckCircle2, 
  X, 
  Layers, 
  Sparkles, 
  Timer, 
  ChevronRight,
  Trash2,
  ChefHat
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { StationTicket } from '../types';

export const StationMonitorModal: React.FC = () => {
  const { 
    stationTickets, 
    updateStationTicketStatus, 
    clearCompletedStationTickets,
    isStationMonitorOpen, 
    setIsStationMonitorOpen 
  } = usePOS();

  const [activeStationFilter, setActiveStationFilter] = useState<'all' | 'kitchen' | 'bar'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'completed' | 'all'>('active');

  if (!isStationMonitorOpen) return null;

  const filteredTickets = stationTickets.filter(ticket => {
    if (activeStationFilter !== 'all' && ticket.station !== activeStationFilter) return false;
    if (statusFilter === 'active' && ticket.status === 'completed') return false;
    if (statusFilter === 'completed' && ticket.status !== 'completed') return false;
    return true;
  });

  const kitchenCount = stationTickets.filter(t => t.station === 'kitchen' && t.status !== 'completed').length;
  const barCount = stationTickets.filter(t => t.station === 'bar' && t.status !== 'completed').length;

  const getStatusBadge = (status: StationTicket['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Pending
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Ready to Serve
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white/40">
            Completed
          </span>
        );
    }
  };

  const getElapsedTime = (dateString: string) => {
    const elapsedMinutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes === 1) return '1m ago';
    return `${elapsedMinutes}m ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.16 }}
        className="w-full max-w-5xl h-[88vh] glass rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl bg-zinc-950/90 text-white"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">Station Dispatch & Kitchen/Bar KDS</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  LIVE ROUTING
                </span>
              </div>
              <p className="text-xs text-white/40">
                Real-time tickets dispatched directly upon order submission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCompletedStationTickets}
              className="px-3 py-1.5 rounded-xl glass text-xs font-mono text-white/50 hover:text-white flex items-center gap-1.5"
              title="Clear completed tickets"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done</span>
            </button>
            <button
              onClick={() => setIsStationMonitorOpen(false)}
              className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between gap-4 bg-black/20 text-xs">
          {/* Station Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStationFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                activeStationFilter === 'all'
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'glass text-white/50 hover:text-white'
              }`}
            >
              All Stations ({stationTickets.length})
            </button>

            <button
              onClick={() => setActiveStationFilter('kitchen')}
              className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                activeStationFilter === 'kitchen'
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'glass text-white/50 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Kitchen ({kitchenCount})</span>
            </button>

            <button
              onClick={() => setActiveStationFilter('bar')}
              className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                activeStationFilter === 'bar'
                  ? 'bg-white text-zinc-950 font-semibold'
                  : 'glass text-white/50 hover:text-white'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Bar ({barCount})</span>
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                statusFilter === 'active' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                statusFilter === 'completed' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white'
              }`}
            >
              Done
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                statusFilter === 'all' ? 'bg-white/20 text-white font-medium' : 'text-white/40 hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Ticket Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTickets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-3 text-white/40">
                <CheckCircle2 className="w-7 h-7 stroke-1" />
              </div>
              <p className="text-base font-medium text-white/80">No active station tickets</p>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                When staff submit orders, items automatically flow here separated into Kitchen (food) and Bar (drinks).
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-2xl glass border flex flex-col justify-between transition-all ${
                    ticket.station === 'kitchen'
                      ? 'border-amber-500/20 bg-amber-500/[0.03]'
                      : 'border-cyan-500/20 bg-cyan-500/[0.03]'
                  }`}
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            ticket.station === 'kitchen' ? 'bg-amber-400' : 'bg-cyan-400'
                          }`} />
                          <span className="font-semibold text-sm text-white">
                            {ticket.tableName}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/40 font-mono mt-0.5">
                          Server: {ticket.serverName || 'Staff'} • {getElapsedTime(ticket.submittedAt)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          ticket.station === 'kitchen' ? 'bg-amber-400/20 text-amber-300' : 'bg-cyan-400/20 text-cyan-300'
                        }`}>
                          {ticket.station === 'kitchen' ? '🍳 Kitchen' : '🍸 Bar'}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>

                    {/* Ticket Items */}
                    <div className="py-3 space-y-2">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded text-[11px]">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-medium text-white/90">{item.name}</span>
                              {item.note && (
                                <p className="text-[11px] text-amber-300/90 font-mono mt-0.5">
                                  ↳ {item.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Station Reply if available */}
                    {ticket.replyMessage && (
                      <div className="mb-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px]">
                        <span className="font-semibold text-white/90">Reply: </span>
                        <span className="text-white/70">{ticket.replyMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Progression Controls */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-white/40">
                      ID: {ticket.id.slice(-6)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {ticket.status === 'pending' && (
                        <button
                          onClick={() => updateStationTicketStatus(ticket.id, 'preparing')}
                          className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-medium transition-colors"
                        >
                          Start Prep
                        </button>
                      )}

                      {ticket.status === 'preparing' && (
                        <button
                          onClick={() => updateStationTicketStatus(ticket.id, 'ready')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
                        >
                          Mark Ready
                        </button>
                      )}

                      {ticket.status === 'ready' && (
                        <button
                          onClick={() => updateStationTicketStatus(ticket.id, 'completed')}
                          className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
                        >
                          Complete
                        </button>
                      )}

                      {ticket.status === 'completed' && (
                        <span className="text-xs text-white/30 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Served
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
