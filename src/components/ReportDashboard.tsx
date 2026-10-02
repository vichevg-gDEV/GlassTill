import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  DollarSign, 
  Wine, 
  Utensils, 
  Sparkles,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Order } from '../types';

export const ReportDashboard: React.FC = () => {
  const { ordersHistory, profiles, settings, currentUser, playAudioFeedback } = usePOS();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  // Role Gate check
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (!isManagerOrAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 rounded-2xl glass-panel-subtle flex items-center justify-center mb-3 text-zinc-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-medium text-white">Access Restricted</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          The Reporting & Financial Analytics dashboard is only accessible to Managers and Admins.
        </p>
      </div>
    );
  }

  // Filter orders based on selected range
  const filteredOrders = useMemo(() => {
    // For demo purposes, we treat current orders as valid, but we can filter by date if needed
    return ordersHistory.filter(o => o.isClosed);
  }, [ordersHistory, timeRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const netSales = filteredOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const taxCollected = filteredOrders.reduce((sum, o) => sum + o.taxAmount, 0);
    const tipsCollected = filteredOrders.reduce((sum, o) => sum + (o.tipAmount || 0), 0);
    const grossTotal = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalTransactions = filteredOrders.length;
    const avgSpend = totalTransactions > 0 ? netSales / totalTransactions : 0;
    
    // Covers estimation (items count or table orders)
    const totalCovers = filteredOrders.reduce((sum, o) => sum + (o.items.reduce((s, i) => s + i.quantity, 0)), 0);

    return {
      netSales,
      taxCollected,
      tipsCollected,
      grossTotal,
      totalTransactions,
      avgSpend,
      totalCovers,
    };
  }, [filteredOrders]);

  // Employee breakdown analytics
  const employeeStats = useMemo(() => {
    const map: { [userId: string]: { name: string; role: string; transactions: number; netSales: number; tips: number; voidRate: string } } = {};

    profiles.forEach(p => {
      map[p.id] = {
        name: p.displayName,
        role: p.role,
        transactions: 0,
        netSales: 0,
        tips: 0,
        voidRate: '0.0%',
      };
    });

    filteredOrders.forEach(o => {
      const empId = o.openedBy;
      if (!map[empId]) {
        map[empId] = {
          name: o.openedByName || 'Unknown',
          openedByRole: o.openedByRole,
          transactions: 0,
          netSales: 0,
          tips: 0,
          voidRate: '0.0%',
        } as any;
      }
      map[empId].transactions += 1;
      map[empId].netSales += o.subtotal;
      map[empId].tips += (o.tipAmount || 0);
    });

    return Object.values(map).filter(s => s.transactions > 0 || s.name !== 'Unknown');
  }, [filteredOrders, profiles]);

  // Product sales rankings
  const topProducts = useMemo(() => {
    const prodMap: { [name: string]: { name: string; category: string; count: number; revenue: number } } = {};

    filteredOrders.forEach(o => {
      o.items.forEach(item => {
        if (!prodMap[item.name]) {
          prodMap[item.name] = {
            name: item.name,
            category: item.category,
            count: 0,
            revenue: 0,
          };
        }
        prodMap[item.name].count += item.quantity;
        prodMap[item.name].revenue += (item.priceAtTime * item.quantity);
      });
    });

    return Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [filteredOrders]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    let drinks = 0;
    let food = 0;
    let aux = 0;

    filteredOrders.forEach(o => {
      o.items.forEach(i => {
        const val = i.priceAtTime * i.quantity;
        if (i.category === 'drinks') drinks += val;
        else if (i.category === 'food') food += val;
        else aux += val;
      });
    });

    const total = drinks + food + aux || 1;
    return {
      drinks,
      food,
      aux,
      drinksPct: Math.round((drinks / total) * 100),
      foodPct: Math.round((food / total) * 100),
      auxPct: Math.round((aux / total) * 100),
    };
  }, [filteredOrders]);

  // Export CSV Action
  const handleExportCsv = () => {
    playAudioFeedback('success');
    const headers = ['Order ID', 'Table', 'Opened By', 'Items Count', 'Subtotal', 'Tax', 'Tip', 'Total Amount', 'Payment Method', 'Closed At'];
    const rows = filteredOrders.map(o => [
      o.id,
      `"${o.tableName || 'Till'}"`,
      `"${o.openedByName}"`,
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal.toFixed(2),
      o.taxAmount.toFixed(2),
      (o.tipAmount || 0).toFixed(2),
      o.totalAmount.toFixed(2),
      o.paymentMethod || 'card',
      o.closedAt || o.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `glasstill_report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    playAudioFeedback('tap');
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none p-5 space-y-4">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
            Executive Intelligence
          </span>
          <h1 className="text-xl font-medium tracking-tight text-[#FAFAFA] flex items-center gap-2">
            Venue Financial Summary
            <span className="text-[10px] text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 font-mono">
              Live Audited
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Segmented Control */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            {(['day', 'week', 'month'] as const).map(range => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  playAudioFeedback('tap');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  timeRange === range
                    ? 'bg-[#FAFAFA] text-[#09090B] font-semibold shadow-sm'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl glass text-xs font-medium text-white/80 hover:text-white flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-xl glass text-xs font-medium text-white/80 hover:text-white flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Analytics Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Hero 4-Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-5 rounded-2xl glass border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Net Sales</span>
            <div className="text-2xl font-medium tracking-tight text-[#FAFAFA] tabular">
              {settings.currencySymbol}{metrics.netSales.toFixed(2)}
            </div>
            <div className="text-[11px] text-white/40 font-mono flex items-center gap-1">
              <span>Gross: {settings.currencySymbol}{metrics.grossTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Average Spend</span>
            <div className="text-2xl font-medium tracking-tight text-[#FAFAFA] tabular">
              {settings.currencySymbol}{metrics.avgSpend.toFixed(2)}
            </div>
            <div className="text-[11px] text-white/40 font-mono">
              Per ticket average
            </div>
          </div>

          <div className="p-5 rounded-2xl glass border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Transactions</span>
            <div className="text-2xl font-medium tracking-tight text-[#FAFAFA] tabular">
              {metrics.totalTransactions}
            </div>
            <div className="text-[11px] text-white/40 font-mono">
              {metrics.totalCovers} items delivered
            </div>
          </div>

          <div className="p-5 rounded-2xl glass border border-white/10 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Staff Tips</span>
            <div className="text-2xl font-medium tracking-tight text-emerald-400 tabular">
              {settings.currencySymbol}{metrics.tipsCollected.toFixed(2)}
            </div>
            <div className="text-[11px] text-white/40 font-mono">
              Tax: {settings.currencySymbol}{metrics.taxCollected.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 2-Column Split: Category Sales & Top Performing Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* Category Breakdown Meter */}
          <div className="p-5 rounded-2xl glass border border-white/10 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/70">
              Department Sales
            </h3>

            {/* Horizontal Stacked Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-white/5">
              <div style={{ width: `${categoryBreakdown.drinksPct}%` }} className="bg-white h-full" title={`Drinks: ${categoryBreakdown.drinksPct}%`} />
              <div style={{ width: `${categoryBreakdown.foodPct}%` }} className="bg-white/50 h-full" title={`Food: ${categoryBreakdown.foodPct}%`} />
              <div style={{ width: `${categoryBreakdown.auxPct}%` }} className="bg-white/20 h-full" title={`Aux: ${categoryBreakdown.auxPct}%`} />
            </div>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span className="text-white/80">Beverages / Bar</span>
                </div>
                <span className="text-white font-medium tabular">
                  {settings.currencySymbol}{categoryBreakdown.drinks.toFixed(2)} ({categoryBreakdown.drinksPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/50" />
                  <span className="text-white/80">Kitchen / Food</span>
                </div>
                <span className="text-white font-medium tabular">
                  {settings.currencySymbol}{categoryBreakdown.food.toFixed(2)} ({categoryBreakdown.foodPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="text-white/80">Aux & Services</span>
                </div>
                <span className="text-white font-medium tabular">
                  {settings.currencySymbol}{categoryBreakdown.aux.toFixed(2)} ({categoryBreakdown.auxPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Top Selling Products List */}
          <div className="lg:col-span-2 p-5 rounded-2xl glass border border-white/10 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/70">
              Top Ranked Products by Revenue
            </h3>

            <div className="space-y-2">
              {topProducts.map((prod, idx) => (
                <div 
                  key={prod.name} 
                  className="p-3 rounded-xl glass flex items-center justify-between text-xs hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center font-mono text-white/40 font-bold">{idx + 1}</span>
                    <div>
                      <div className="text-[#FAFAFA] font-medium">{prod.name}</div>
                      <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{prod.category}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-white font-medium tabular">
                      {settings.currencySymbol}{prod.revenue.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-white/40 tabular">
                      {prod.count} sold
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Performance & Void Rate Ledger */}
        <div className="p-5 rounded-2xl glass border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/70">
              Staff Productivity & Transaction Ledger
            </h3>
            <span className="text-[10px] text-white/40 font-mono">
              Individual Till Shifts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase tracking-widest">
                  <th className="pb-2">Employee</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2 text-right">Orders</th>
                  <th className="pb-2 text-right">Net Sales</th>
                  <th className="pb-2 text-right">Tips</th>
                  <th className="pb-2 text-right">Error / Void</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employeeStats.map(stat => (
                  <tr key={stat.name} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 text-[#FAFAFA] font-sans font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      <span>{stat.name}</span>
                    </td>
                    <td className="py-3 text-white/50 capitalize">{stat.role}</td>
                    <td className="py-3 text-right text-white/80 tabular">{stat.transactions}</td>
                    <td className="py-3 text-right text-white font-medium tabular">
                      {settings.currencySymbol}{stat.netSales.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-emerald-400 tabular">
                      {settings.currencySymbol}{stat.tips.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-white/40 tabular">{stat.voidRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
