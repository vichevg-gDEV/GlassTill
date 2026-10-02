import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Banknote, 
  Split, 
  Bookmark, 
  Check, 
  X, 
  Printer, 
  Receipt as ReceiptIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { activeOrder, checkoutActiveOrder, settings, selectedTable } = usePOS();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'split' | 'tab'>('card');
  const [tipPercentage, setTipPercentage] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>('');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [splitWays, setSplitWays] = useState<number>(2);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // Tip calculation
  const subtotal = activeOrder.subtotal;
  const tax = activeOrder.taxAmount;
  
  let calculatedTip = 0;
  if (customTip !== '') {
    calculatedTip = parseFloat(customTip) || 0;
  } else if (tipPercentage > 0) {
    calculatedTip = Number(((subtotal * tipPercentage) / 100).toFixed(2));
  }

  const grandTotal = Number((subtotal + tax + calculatedTip).toFixed(2));
  const splitAmount = splitWays > 0 ? Number((grandTotal / splitWays).toFixed(2)) : grandTotal;
  
  const cashGivenNum = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, Number((cashGivenNum - grandTotal).toFixed(2)));

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const finished = checkoutActiveOrder(paymentMethod, calculatedTip, paymentMethod === 'split' ? splitWays : undefined);
      setCompletedOrder(finished);
      setIsProcessing(false);
    }, 600);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const resetAndClose = () => {
    setCompletedOrder(null);
    setIsProcessing(false);
    setCashGiven('');
    setCustomTip('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/80 p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-[#151518] rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header - Touch Sized */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              {completedOrder ? 'Payment Settled' : 'Payment Terminal'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              {activeOrder.tableName || 'Walk-up Till'}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                #{activeOrder.id.slice(-6).toUpperCase()}
              </span>
            </h2>
          </div>
          <button
            onClick={resetAndClose}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {!completedOrder ? (
            <>
              {/* Grand Total Hero Callout */}
              <div className="text-center py-5 px-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
                <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest font-semibold">TOTAL DUE</span>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-amber-400 font-mono tabular my-1.5">
                  {settings.currencySymbol}{grandTotal.toFixed(2)}
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 flex items-center justify-center gap-2 tabular font-mono">
                  <span>Sub: {settings.currencySymbol}{subtotal.toFixed(2)}</span>
                  <span>•</span>
                  <span>Tax: {settings.currencySymbol}{tax.toFixed(2)}</span>
                  {calculatedTip > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">Tip: {settings.currencySymbol}{calculatedTip.toFixed(2)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Tip Selection Pills - Touch Sized */}
              <div>
                <label className="text-xs text-zinc-400 block mb-2 font-mono uppercase tracking-widest font-semibold">
                  Gratuity / Tip
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 15, 18, 20].map(pct => (
                    <button
                      key={pct}
                      id={`tip-pct-${pct}`}
                      onClick={() => {
                        setTipPercentage(pct);
                        setCustomTip('');
                      }}
                      className={`h-12 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
                        tipPercentage === pct && customTip === ''
                          ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {pct === 0 ? 'No Tip' : `${pct}%`}
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Custom"
                      id="custom-tip-input"
                      value={customTip}
                      onChange={e => {
                        setCustomTip(e.target.value);
                        setTipPercentage(-1);
                      }}
                      className={`w-full h-12 rounded-xl text-xs sm:text-sm font-mono text-center outline-none transition-all ${
                        customTip !== ''
                          ? 'bg-zinc-100 text-zinc-950 font-bold'
                          : 'bg-zinc-900 text-white border border-zinc-800 placeholder-zinc-500 focus:border-amber-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods - Large Touch Cards */}
              <div>
                <label className="text-xs text-zinc-400 block mb-2 font-mono uppercase tracking-widest font-semibold">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'split', label: 'Split Bill', icon: Split },
                  ].map(m => {
                    const Icon = m.icon;
                    const isActive = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        id={`pay-method-${m.id}`}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all ${
                          isActive
                            ? 'bg-zinc-100 text-zinc-950 border-white shadow-lg font-bold'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                        <span className="text-xs sm:text-sm font-semibold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method-Specific Sub-Panels */}
              {paymentMethod === 'cash' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-400 font-mono uppercase text-xs font-semibold">CASH TENDERED</span>
                    <span className="text-zinc-200 font-mono font-bold">
                      Due: {settings.currencySymbol}{grandTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Fast Tender Pills - Touch Sized */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Exact', val: grandTotal },
                      { label: '$20', val: 20 },
                      { label: '$50', val: 50 },
                      { label: '$100', val: 100 },
                    ].map(pill => (
                      <button
                        key={pill.label}
                        onClick={() => setCashGiven(pill.val.toString())}
                        className="h-11 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs sm:text-sm font-mono font-bold text-zinc-200 hover:text-white transition-all shadow-sm"
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-base">
                        {settings.currencySymbol}
                      </span>
                      <input
                        type="number"
                        placeholder="Amount given"
                        id="cash-tendered-input"
                        value={cashGiven}
                        onChange={e => setCashGiven(e.target.value)}
                        className="w-full h-12 pl-8 pr-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-base font-bold outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-right min-w-[120px]">
                      <div className="text-[10px] text-zinc-400 font-mono uppercase font-bold">CHANGE</div>
                      <div className={`text-lg font-mono font-bold tabular ${changeDue > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {settings.currencySymbol}{changeDue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'split' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3.5 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-400 font-mono uppercase text-xs font-semibold">SPLIT EQUALLY</span>
                    <span className="text-zinc-200 font-mono font-bold">Total: {settings.currencySymbol}{grandTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setSplitWays(num)}
                        className={`flex-1 h-12 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
                          splitWays === num
                            ? 'bg-zinc-100 text-zinc-950 shadow-md'
                            : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800'
                        }`}
                      >
                        {num} Ways
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-zinc-400 font-mono font-bold">PER PERSON:</span>
                    <span className="text-xl font-mono font-bold text-amber-400 tabular">
                      {settings.currencySymbol}{splitAmount.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Settlement Success & Receipt View */
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Payment Authorized</h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Settled via {completedOrder.paymentMethod?.toUpperCase()} • Ref #{completedOrder.id.slice(-8)}
                </p>
              </div>

              {/* Thermal Receipt Simulator */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 font-mono text-xs text-zinc-200 space-y-3 shadow-inner">
                <div className="text-center pb-3 border-b border-dashed border-zinc-800">
                  <div className="font-bold text-base text-white">{settings.venueName}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {new Date(completedOrder.closedAt || '').toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Server: {completedOrder.openedByName} • {completedOrder.tableName}
                  </div>
                </div>

                <div className="space-y-1.5 py-1.5">
                  {completedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-zinc-100 font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="tabular font-bold">
                        {settings.currencySymbol}{(item.priceAtTime * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-dashed border-zinc-800 space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>SUBTOTAL</span>
                    <span>{settings.currencySymbol}{completedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>TAX ({(settings.taxRate * 100).toFixed(1)}%)</span>
                    <span>{settings.currencySymbol}{completedOrder.taxAmount.toFixed(2)}</span>
                  </div>
                  {completedOrder.tipAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>TIP</span>
                      <span>{settings.currencySymbol}{completedOrder.tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-zinc-800">
                    <span>TOTAL</span>
                    <span className="text-amber-400">{settings.currencySymbol}{completedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-3 text-xs text-zinc-500 border-t border-dashed border-zinc-800">
                  {settings.receiptFooter}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Touch Sized */}
        <div className="p-4 border-t border-zinc-800 bg-[#121215] flex items-center justify-between gap-3">
          {!completedOrder ? (
            <>
              <button
                onClick={resetAndClose}
                className="h-14 px-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                id="confirm-charge-button"
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="flex-1 h-14 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl cursor-pointer"
              >
                {isProcessing ? (
                  <span className="inline-block w-5 h-5 border-3 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Charge {settings.currencySymbol}{grandTotal.toFixed(2)}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePrintReceipt}
                className="h-14 px-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-bold text-zinc-200 hover:text-white flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={resetAndClose}
                className="flex-1 h-14 px-6 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl"
              >
                <span>New Ticket</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
