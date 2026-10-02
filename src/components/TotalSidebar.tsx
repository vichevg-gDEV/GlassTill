import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Send, 
  Trash2, 
  Plus, 
  Minus, 
  MessageSquare, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Receipt,
  Utensils,
  Wine,
  AlertCircle
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { CheckoutModal } from './CheckoutModal';
import { OrderItem } from '../types';

export const TotalSidebar: React.FC = () => {
  const { 
    activeOrder, 
    selectedTable, 
    removeItemFromOrder, 
    updateItemQuantity, 
    updateItemNote, 
    submitActiveOrder, 
    clearActiveOrder,
    settings,
    stationTickets,
    lastSubmissionNotice,
    clearSubmissionNotice
  } = usePOS();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const unsubmittedItems = activeOrder.items.filter(item => item.status === 'unsubmitted');
  const submittedItems = activeOrder.items.filter(item => item.status === 'submitted');

  const unsubmittedCount = unsubmittedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = activeOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  // Group unsubmitted by destination
  const pendingFoodCount = unsubmittedItems
    .filter(i => (i as any).destinationStation === 'kitchen' || !(i as any).destinationStation)
    .reduce((s, i) => s + i.quantity, 0);
  const pendingDrinkCount = unsubmittedItems
    .filter(i => (i as any).destinationStation === 'bar')
    .reduce((s, i) => s + i.quantity, 0);

  // Find replies for active table / ticket
  const ticketsWithReplies = stationTickets.filter(
    t => t.tableName === activeOrder.tableName && t.replyMessage && t.status !== 'completed'
  );

  const handleOpenNote = (item: OrderItem) => {
    setEditingNoteItemId(item.id);
    setNoteInput(item.note || '');
  };

  const handleSaveNote = () => {
    if (editingNoteItemId) {
      updateItemNote(editingNoteItemId, noteInput.trim());
      setEditingNoteItemId(null);
      setNoteInput('');
    }
  };

  const handleSubmitOrder = () => {
    if (unsubmittedCount === 0) return;
    submitActiveOrder();
  };

  return (
    <aside className="w-80 md:w-96 lg:w-[400px] xl:w-[420px] bg-[#121215] border-l border-zinc-800 flex flex-col h-full overflow-hidden select-none relative font-['Inter',sans-serif] shrink-0">
      {/* Toast Notice of submission */}
      <AnimatePresence>
        {lastSubmissionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-2 right-2 z-30 p-3 rounded-xl bg-emerald-500 text-zinc-950 shadow-xl flex items-center justify-between text-xs sm:text-sm font-bold"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="truncate">{lastSubmissionNotice.text}</span>
            </div>
            <button
              onClick={clearSubmissionNotice}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Header */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-800 flex items-center justify-between bg-[#151518] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              {selectedTable ? 'Table Tab' : 'Walk-up Till'}
            </span>
            {selectedTable && (
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold">
                {selectedTable.section}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
            {activeOrder.tableName || 'Walk-up Till'}
            <span className="text-xs text-zinc-400 font-mono font-normal">
              ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
            </span>
          </h2>
        </div>

        {activeOrder.items.length > 0 && (
          <button
            onClick={clearActiveOrder}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-rose-400 h-9 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/30 transition-all flex items-center gap-1 shadow-sm"
            title="Clear all items from ticket"
          >
            Clear Tab
          </button>
        )}
      </div>

      {/* Active Station Replies / Alerts */}
      {ticketsWithReplies.length > 0 && (
        <div className="px-3 sm:px-4 pt-3 space-y-2 shrink-0">
          {ticketsWithReplies.map(ticket => (
            <div
              key={`reply-${ticket.id}`}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 shadow-sm ${
                ticket.station === 'kitchen'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                  : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200'
              }`}
            >
              {ticket.station === 'kitchen' ? (
                <Utensils className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Wine className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[11px] uppercase font-mono">
                    {ticket.station === 'kitchen' ? 'Kitchen KDS' : 'Bar Station'}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono font-bold">
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-zinc-100 text-xs sm:text-sm mt-0.5 leading-snug">
                  {ticket.replyMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item List with Large Touch Steppers */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {activeOrder.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2.5">
            <Receipt className="w-10 h-10 stroke-1 text-zinc-600 mb-1" />
            <p className="text-sm font-medium text-zinc-400">Tab is currently empty</p>
            <p className="text-xs text-zinc-500">Tap items from the menu grid to ring them up</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activeOrder.items.map(item => {
              const isUnsubmitted = item.status === 'unsubmitted';
              const lineTotal = item.priceAtTime * item.quantity;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-xs sm:text-sm flex flex-col gap-2 transition-all ${
                    isUnsubmitted
                      ? 'bg-[#18181c] border-amber-400/30 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  {/* Top Line: Name + Status Badge + Line Price */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-100 truncate text-sm sm:text-base">
                          {item.name}
                        </span>
                        
                        {isUnsubmitted ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold">
                            ● New
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                            ✓ Sent
                          </span>
                        )}
                      </div>

                      {item.note && (
                        <p className="text-xs text-amber-300 italic mt-1 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 inline-block font-medium">
                          Note: {item.note}
                        </p>
                      )}
                    </div>

                    <span className="font-mono font-bold text-zinc-100 text-sm sm:text-base tabular shrink-0">
                      {settings.currencySymbol}{lineTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Bottom Line: Note trigger & Large Touch Quantity Steppers */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleOpenNote(item)}
                      className="h-9 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-zinc-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.note ? 'Edit Note' : '+ Note'}</span>
                    </button>

                    {/* Touch Friendly Steppers (min 40px touch area) */}
                    <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                      <button
                        onClick={() => updateItemQuantity(item.id, -1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-zinc-200 hover:text-white transition-all shadow-sm"
                        title="Decrease quantity"
                      >
                        <Minus className="w-4 h-4 font-bold" />
                      </button>

                      <span className="w-8 text-center font-mono font-bold text-sm sm:text-base text-white tabular">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateItemQuantity(item.id, 1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 flex items-center justify-center text-zinc-200 hover:text-white transition-all shadow-sm"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4 font-bold" />
                      </button>

                      <button
                        onClick={() => removeItemFromOrder(item.id)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 flex items-center justify-center transition-all ml-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Note Editor Drawer */}
      {editingNoteItemId && (
        <div className="p-3.5 sm:p-4 bg-zinc-900 border-t border-zinc-700 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">Kitchen / Bar Note</span>
            <button
              onClick={() => setEditingNoteItemId(null)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="e.g. Extra spicy, on the rocks, no onions"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
              autoFocus
              className="flex-1 h-11 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 text-xs sm:text-sm text-white outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSaveNote}
              className="h-11 px-4 rounded-xl bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold hover:bg-white transition-all shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Bottom Summary & Actions - Touch Prominent */}
      <div className="p-3.5 sm:p-4 space-y-3.5 bg-[#0d0d10] border-t border-zinc-800 shrink-0">
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span className="tabular font-mono text-zinc-200">{settings.currencySymbol}{activeOrder.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Tax ({(settings.taxRate * 100).toFixed(1)}%)</span>
            <span className="tabular font-mono text-zinc-200">{settings.currencySymbol}{activeOrder.taxAmount.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex justify-between items-baseline text-white">
            <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 font-semibold">Grand Total</span>
            <span className="text-2xl font-bold font-mono tabular tracking-tight text-amber-400">
              {settings.currencySymbol}{activeOrder.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Prominent Touch Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* SUBMIT ORDER BUTTON */}
          <button
            id="submit-order-button"
            disabled={unsubmittedCount === 0}
            onClick={handleSubmitOrder}
            className={`w-full h-13 sm:h-14 px-4 rounded-2xl font-bold text-xs sm:text-sm tracking-tight flex items-center justify-between transition-all ${
              unsubmittedCount > 0
                ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-lg active:scale-[0.98] cursor-pointer'
                : 'bg-zinc-800/40 text-zinc-600 border border-zinc-800/60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>
                {unsubmittedCount > 0
                  ? `Submit Order (${unsubmittedCount} new)`
                  : submittedItems.length > 0
                  ? 'All Items Dispatched ✓'
                  : 'Submit Order'}
              </span>
            </div>

            {unsubmittedCount > 0 ? (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-black/20 px-2 py-1 rounded-lg">
                {pendingFoodCount > 0 && <span>🍳 {pendingFoodCount}</span>}
                {pendingDrinkCount > 0 && <span>🍸 {pendingDrinkCount}</span>}
                <span>→ Stations</span>
              </div>
            ) : (
              <span className="text-xs font-mono text-zinc-600">
                {submittedItems.length > 0 ? 'In Production' : '0 Items'}
              </span>
            )}
          </button>

          {/* CHARGE / CHECKOUT BUTTON */}
          <button
            id="charge-checkout-button"
            disabled={activeOrder.items.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className={`w-full h-14 sm:h-15 px-4 rounded-2xl font-bold text-sm sm:text-base tracking-tight flex items-center justify-between transition-all ${
              activeOrder.items.length === 0
                ? 'bg-zinc-800/40 text-zinc-600 border border-zinc-800/60 cursor-not-allowed'
                : 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-[0.98] shadow-xl cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Charge & Close Bill</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold tabular">{settings.currencySymbol}{activeOrder.totalAmount.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Checkout Modal Dialog */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </aside>
  );
};
