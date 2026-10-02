import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POSProvider, usePOS } from './context/POSContext';
import { LockScreen } from './components/LockScreen';
import { NavigationDock } from './components/NavigationDock';
import { TablesCanvas } from './components/TablesCanvas';
import { ProductGrid } from './components/ProductGrid';
import { TotalSidebar } from './components/TotalSidebar';
import { ReportDashboard } from './components/ReportDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { StationMonitorModal } from './components/StationMonitorModal';
import { KitchenStationView } from './components/KitchenStationView';
import { BarStationView } from './components/BarStationView';
import { AdminMenuManager } from './components/AdminMenuManager';
import { ShoppingBag, ArrowRight, Send, CreditCard, ChevronUp } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    switchTab, 
    settings, 
    categories, 
    activeOrder, 
    submitActiveOrder,
    selectedTable 
  } = usePOS();

  const [mobileTicketDrawerOpen, setMobileTicketDrawerOpen] = useState<boolean>(false);

  // Determine active view mode
  const isCategoryTab = categories.some(c => c.id === activeTab);
  const isOrderingStage = isCategoryTab || activeTab === 'tables';

  // Dedicated station interface view (Kitchen or Bar)
  const isKitchenView = activeTab === 'kitchen' || currentUser?.role === 'kitchen';
  const isBarView = activeTab === 'bar' || currentUser?.role === 'bar';

  const itemCount = activeOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  const unsubmittedCount = activeOrder.items.filter(i => i.status === 'unsubmitted').reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none relative font-["Inter",sans-serif] ${
      settings.theme === 'light' ? 'theme-light bg-[#f4f4f5] text-zinc-900' : 'bg-[#09090B] text-[#FAFAFA]'
    }`}>
      {/* Top Main Navigation Bar */}
      <NavigationDock />

      {/* Main Operational Stage */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        {/* Left / Center Stage Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0c0f]">
          <AnimatePresence mode="wait">
            {/* Tables Floor Plan */}
            {activeTab === 'tables' && (
              <motion.div
                key="tables"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <TablesCanvas />
              </motion.div>
            )}

            {/* Dedicated Kitchen KDS Interface */}
            {isKitchenView && (
              <motion.div
                key="kitchen-kds"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <KitchenStationView />
              </motion.div>
            )}

            {/* Dedicated Bar KDS Interface */}
            {isBarView && (
              <motion.div
                key="bar-kds"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <BarStationView />
              </motion.div>
            )}

            {/* Admin Menu Manager Tab */}
            {activeTab === 'menu' && (
              <motion.div
                key="admin-menu-manager"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <AdminMenuManager />
              </motion.div>
            )}

            {/* Dynamic Product Grid for any Menu Category */}
            {isCategoryTab && !isKitchenView && !isBarView && (
              <motion.div
                key={`cat-${activeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <ProductGrid category={activeTab} />
              </motion.div>
            )}

            {/* Reports & Analytics */}
            {activeTab === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <ReportDashboard />
              </motion.div>
            )}

            {/* Settings & Admin Panel */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <SettingsPanel />
              </motion.div>
            )}

            {/* Dedicated Total / Ticket View for Compact Screens */}
            {activeTab === 'total' && (
              <motion.div
                key="total-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="h-full flex flex-col"
              >
                <TotalSidebar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Viewport Bottom Order Bar (visible when screen < lg and in order stage) */}
          {isOrderingStage && !isKitchenView && !isBarView && itemCount > 0 && (
            <div className="lg:hidden p-2.5 bg-[#121215] border-t border-zinc-800 flex items-center justify-between gap-2 shrink-0 z-10 shadow-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchTab('total')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-700"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tab ({itemCount})</span>
                </button>
                <span className="text-xs font-mono font-bold text-white tabular">
                  {settings.currencySymbol}{activeOrder.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {unsubmittedCount > 0 && (
                  <button
                    onClick={submitActiveOrder}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1 hover:bg-amber-300 shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit ({unsubmittedCount})</span>
                  </button>
                )}
                <button
                  onClick={() => switchTab('total')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-bold flex items-center gap-1 hover:bg-white"
                >
                  <span>Pay</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (Desktop only, visible during ordering and table operations) */}
        {isOrderingStage && !isKitchenView && !isBarView && (
          <div className="hidden lg:flex w-[340px] xl:w-[370px] h-full shrink-0">
            <TotalSidebar />
          </div>
        )}
      </main>

      {/* Live Station Monitor Modal */}
      <StationMonitorModal />

      {/* PIN Lock Screen Overlay */}
      <AnimatePresence>
        {(!currentUser || activeTab === 'lock') && (
          <LockScreen />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainAppLayout />
    </POSProvider>
  );
}
