import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Grid2X2, 
  Wine, 
  UtensilsCrossed, 
  Receipt, 
  BarChart3, 
  Sliders, 
  Clock, 
  ChefHat, 
  Tag, 
  FolderKanban,
  CheckCircle2,
  Bell,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { TabType } from '../types';

export const NavigationDock: React.FC = () => {
  const { 
    activeTab, 
    switchTab, 
    currentUser, 
    activeOrder, 
    syncStatus, 
    settings,
    stationTickets,
    categories,
    selectedTable,
    setIsStationMonitorOpen
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const itemCount = activeOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  const activeTicketCount = stationTickets.filter(t => t.status !== 'completed').length;
  const kitchenTicketCount = stationTickets.filter(t => t.station === 'kitchen' && t.status !== 'completed').length;
  const barTicketCount = stationTickets.filter(t => t.station === 'bar' && t.status !== 'completed').length;

  const canAccessManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const isAdmin = currentUser?.role === 'admin';

  // Check if currently on an ordering category tab
  const isOrderingTab = categories.some(c => c.id === activeTab) || activeTab === 'total';

  const handleOrderNavClick = () => {
    // If currently not on an ordering category, switch to the first category
    if (!categories.some(c => c.id === activeTab)) {
      switchTab(categories[0]?.id || 'drinks');
    }
  };

  return (
    <header className="w-full bg-[#121215] border-b border-zinc-800/80 px-3 sm:px-4 py-2.5 select-none z-20 font-['Inter',sans-serif] shrink-0">
      <div className="w-full flex items-center justify-between gap-2.5">
        {/* Left: Brand, Active Table, Staff Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-sm shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white uppercase hidden sm:inline leading-none">
                {settings.venueName || 'LUMATILL'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider mt-0.5">
                LUMATILL POS
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block shrink-0" />

          {/* Active Table Pill - Touch Sized */}
          {selectedTable ? (
            <div 
              onClick={() => switchTab('tables')}
              className="flex items-center gap-2 h-10 px-3 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs shrink-0 font-semibold cursor-pointer hover:bg-amber-400/25 transition-all shadow-sm"
              title="Click to view table floor plan"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{selectedTable.tableName}</span>
              <span className="text-[11px] text-amber-400/70 hidden md:inline">({selectedTable.section})</span>
            </div>
          ) : (
            <div 
              onClick={() => switchTab('tables')}
              className="flex items-center gap-2 h-10 px-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs shrink-0 cursor-pointer hover:bg-zinc-700 hidden md:flex transition-all"
              title="Click to select table"
            >
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span>Walk-up Till</span>
            </div>
          )}

          {/* Staff User Profile Pill */}
          {currentUser && (
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-zinc-800/50 border border-zinc-700/40 text-xs shrink-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm ${
                currentUser.role === 'admin' ? 'bg-amber-600' :
                currentUser.role === 'manager' ? 'bg-blue-600' :
                currentUser.role === 'kitchen' ? 'bg-orange-600' :
                currentUser.role === 'bar' ? 'bg-cyan-600' : 'bg-zinc-700'
              }`}>
                {currentUser.displayName.slice(0, 1)}
              </div>
              <span className="text-zinc-200 font-semibold text-xs hidden lg:inline">{currentUser.displayName}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider hidden xl:inline">
                ({currentUser.role})
              </span>
            </div>
          )}
        </div>

        {/* Center: Main Navigation Modes - Touch Sized */}
        <nav className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl shrink-0" id="core-nav-dock">
          {/* Tables / Floor Plan */}
          <button
            id="nav-tab-tables"
            onClick={() => switchTab('tables')}
            className={`h-11 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'tables'
                ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <Grid2X2 className="w-4 h-4" />
            <span className="hidden sm:inline">Tables</span>
          </button>

          {/* Order / Menu Tabs Trigger */}
          <button
            id="nav-tab-order"
            onClick={handleOrderNavClick}
            className={`h-11 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              isOrderingTab
                ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Order Menu</span>
            {itemCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                isOrderingTab ? 'bg-zinc-900 text-white' : 'bg-amber-400 text-zinc-950'
              }`}>
                {itemCount}
              </span>
            )}
          </button>

          {/* Kitchen Station Tab */}
          <button
            id="nav-tab-kitchen"
            onClick={() => switchTab('kitchen')}
            className={`h-11 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'kitchen'
                ? 'bg-amber-400 text-zinc-950 shadow-md font-bold'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/10'
            }`}
            title="Kitchen Display System (KDS)"
          >
            <ChefHat className="w-4 h-4" />
            <span className="hidden md:inline">Kitchen</span>
            {kitchenTicketCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500 text-zinc-950 shadow-sm">
                {kitchenTicketCount}
              </span>
            )}
          </button>

          {/* Bar Station Tab */}
          <button
            id="nav-tab-bar"
            onClick={() => switchTab('bar')}
            className={`h-11 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'bar'
                ? 'bg-cyan-400 text-zinc-950 shadow-md font-bold'
                : 'text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-400/10'
            }`}
            title="Bar Display System"
          >
            <Wine className="w-4 h-4" />
            <span className="hidden md:inline">Bar</span>
            {barTicketCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500 text-zinc-950 shadow-sm">
                {barTicketCount}
              </span>
            )}
          </button>

          {/* Report Tab (Manager/Admin) */}
          {canAccessManagement && (
            <button
              id="nav-tab-report"
              onClick={() => switchTab('report')}
              className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'report'
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">Reports</span>
            </button>
          )}

          {/* Admin Menu & Settings Tab (Manager/Admin) */}
          {canAccessManagement && (
            <button
              id="nav-tab-settings"
              onClick={() => switchTab('settings')}
              className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'settings' || activeTab === 'menu'
                  ? 'bg-amber-400 text-zinc-950 shadow-md font-bold'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
              title="Admin Settings & Menu Editor"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </nav>

        {/* Right Utilities: Stations, Lock, Clock - Touch Sized */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Stations Monitor Button */}
          <button
            id="open-kds-stations-btn"
            onClick={() => setIsStationMonitorOpen(true)}
            className="h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all shadow-sm"
            title="Open Live Kitchen & Bar Stations Monitor"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Stations</span>
            {activeTicketCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-zinc-950">
                {activeTicketCount}
              </span>
            )}
          </button>

          {/* Sync status */}
          <div 
            className="w-2.5 h-2.5 rounded-full hidden sm:block" 
            title={syncStatus === 'synced' ? 'Synced with all terminals' : 'Syncing...'}
          >
            <span className={`block w-2.5 h-2.5 rounded-full ${
              syncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
          </div>

          {/* Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <Clock className="w-4 h-4 text-zinc-500" />
            <span>{currentTime}</span>
          </div>

          {/* Lock Screen Button */}
          <button
            id="nav-tab-lock"
            onClick={() => switchTab('lock')}
            className="h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-red-300 flex items-center gap-2 transition-all shadow-sm"
            title="Lock terminal"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden md:inline">Lock</span>
          </button>
        </div>
      </div>
    </header>
  );
};
