import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Grid2X2, 
  Move, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Users, 
  X, 
  Layers, 
  Sparkles,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  LayoutGrid,
  MapPin,
  Clock,
  User,
  Coffee,
  Wine,
  Utensils
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { VenueTable, TableStatus } from '../types';

export const TablesCanvas: React.FC = () => {
  const { 
    tables, 
    selectedTable, 
    selectTable, 
    updateTableLayout, 
    addTable, 
    deleteTable, 
    updateTableDetails, 
    currentUser,
    openOrders,
    categories,
    switchTab,
    settings,
    clearActiveOrder
  } = usePOS();

  const [viewMode, setViewMode] = useState<'floorplan' | 'grid'>('floorplan');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<VenueTable | null>(null);
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Table Form State
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableSection, setNewTableSection] = useState<string>('Dining Hall');
  const [newTableShape, setNewTableShape] = useState<'circle' | 'rectangle' | 'booth'>('rectangle');
  const [newTableSeats, setNewTableSeats] = useState<number>(4);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Sections
  const sections = ['All', 'Main Bar', 'Dining Hall', 'Lounge', 'Patio'];

  // Dragging state for Floor Plan
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handlePointerDown = (table: VenueTable, e: React.PointerEvent) => {
    if (!isEditMode) return;
    setDraggingId(table.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert to percentage coordinates
    let pctX = Math.round((clientX / rect.width) * 100);
    let pctY = Math.round((clientY / rect.height) * 100);

    // Grid snap step (4%)
    pctX = Math.round(pctX / 4) * 4;
    pctY = Math.round(pctY / 4) * 4;

    // Bounds check
    pctX = Math.max(10, Math.min(90, pctX));
    pctY = Math.max(10, Math.min(90, pctY));

    updateTableLayout(draggingId, pctX, pctY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      setDraggingId(null);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    addTable({
      tableName: newTableName.trim(),
      section: newTableSection,
      shape: newTableShape,
      seats: Number(newTableSeats) || 4,
      posX: 50,
      posY: 50,
    });

    setNewTableName('');
    setIsAddModalOpen(false);
  };

  const handleTableClick = (table: VenueTable) => {
    if (isEditMode) {
      setEditingTable(table);
    } else {
      selectTable(table);
    }
  };

  const handleTakeOrderForTable = (table: VenueTable) => {
    selectTable(table);
    switchTab(categories[0]?.id || 'drinks');
  };

  const handleClearTable = (tableId: string) => {
    updateTableDetails(tableId, { status: 'empty', assignedServer: undefined });
    if (selectedTable?.id === tableId) {
      clearActiveOrder();
    }
  };

  const getStatusColor = (status: TableStatus, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-xl shadow-amber-950/40 ring-2 ring-amber-400 ring-offset-2 ring-offset-black';
    }
    switch (status) {
      case 'occupied':
        return 'bg-zinc-800/90 border-zinc-500 text-zinc-100 shadow-md hover:border-zinc-300';
      case 'billed':
        return 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md hover:bg-amber-500/30';
      case 'action_required':
        return 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md animate-pulse';
      case 'empty':
      default:
        return 'bg-[#151518] border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-[#1a1a1f]';
    }
  };

  const filteredTables = tables.filter(t => 
    activeSectionFilter === 'All' || t.section === activeSectionFilter
  );

  // Active table order info
  const selectedTableOrder = selectedTable ? openOrders[selectedTable.id] : null;
  const selectedTableTotal = selectedTableOrder ? selectedTableOrder.totalAmount : 0;
  const selectedTableItemCount = selectedTableOrder ? selectedTableOrder.items.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none relative bg-[#09090b] font-['Inter',sans-serif]">
      {/* Top Controls Header - Touch Sized */}
      <div className="p-3 sm:p-4 border-b border-zinc-800 bg-[#121215] flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: View Mode Toggle & Walk-up Quick Switch */}
        <div className="flex items-center gap-2">
          {/* Floor Plan vs Grid Toggle */}
          <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setViewMode('floorplan')}
              className={`h-10 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'floorplan'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Floor Plan</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`h-10 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid2X2 className="w-4 h-4" />
              <span>Table List ({tables.length})</span>
            </button>
          </div>

          {/* Quick Switch to Walk-up Mode */}
          <button
            id="walkup-till-toggle-btn"
            onClick={() => {
              selectTable(null);
            }}
            className={`h-10 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
              !selectedTable
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>Walk-up Mode</span>
          </button>
        </div>

        {/* Section Filters - Large Touch Targets */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSectionFilter(sec)}
              className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeSectionFilter === sec
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span>{sec}</span>
            </button>
          ))}
        </div>

        {/* Edit Layout Toggle (Manager & Admin Only) */}
        {isManagerOrAdmin && (
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="h-10 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Table</span>
              </button>
            )}

            <button
              id="toggle-layout-edit-btn"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isEditMode
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              <Move className="w-4 h-4" />
              <span>{isEditMode ? 'Finish Layout' : 'Edit Layout'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Floor Plan Stage or Grid View */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {viewMode === 'floorplan' ? (
          /* 2D Canvas Stage - Touch Sized Table Nodes */
          <div
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`flex-1 relative overflow-hidden m-3 sm:m-4 rounded-2xl bg-[#0e0e11] border border-zinc-800 ${
              isEditMode ? 'canvas-dot-grid cursor-crosshair' : ''
            }`}
          >
            {/* Floor Map Section Orientation Badges */}
            <div className="absolute top-4 left-5 text-[11px] font-mono tracking-widest text-zinc-500 uppercase pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span>Entrance • Main Bar</span>
            </div>
            <div className="absolute top-4 right-5 text-[11px] font-mono tracking-widest text-zinc-500 uppercase pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span>VIP Lounge & Booths</span>
            </div>
            <div className="absolute bottom-4 left-5 text-[11px] font-mono tracking-widest text-zinc-500 uppercase pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
              <span>Dining Hall Floor</span>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-5 flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-400 pointer-events-none shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-500" />
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Billed</span>
              </div>
            </div>

            {/* Render Large Touch Table Nodes */}
            {filteredTables.map(table => {
              const isSelected = selectedTable?.id === table.id;
              const statusClass = getStatusColor(table.status, isSelected);
              const orderForTable = openOrders[table.id];
              const billAmount = orderForTable ? orderForTable.totalAmount : 0;
              const hasItems = orderForTable && orderForTable.items.length > 0;

              // Generous Touch-Friendly Table Dimensions
              let shapeClasses = 'rounded-2xl w-28 h-28 sm:w-32 sm:h-32';
              if (table.shape === 'circle') shapeClasses = 'rounded-full w-28 h-28 sm:w-32 sm:h-32';
              if (table.shape === 'booth') shapeClasses = 'rounded-3xl w-32 h-26 sm:w-36 sm:h-28 border-2';

              return (
                <motion.div
                  key={table.id}
                  id={`table-node-${table.id}`}
                  style={{
                    left: `${table.posX}%`,
                    top: `${table.posY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onPointerDown={e => handlePointerDown(table, e)}
                  onClick={() => handleTableClick(table)}
                  whileHover={{ scale: isEditMode ? 1.05 : 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`absolute cursor-pointer flex flex-col items-center justify-between p-3 border transition-all select-none ${shapeClasses} ${statusClass} ${
                    isEditMode ? 'hover:border-amber-400 hover:shadow-lg' : ''
                  }`}
                >
                  {/* Table Header / Number */}
                  <div className="w-full flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
                      {table.section.slice(0, 3)}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{table.seats}</span>
                    </div>
                  </div>

                  {/* Table Main Name */}
                  <div className="text-center my-auto pointer-events-none">
                    <span className="text-sm sm:text-base font-bold tracking-tight text-white block leading-tight">
                      {table.tableName}
                    </span>
                    {table.assignedServer && (
                      <span className="text-[10px] text-zinc-400 truncate max-w-[90px] block font-mono">
                        {table.assignedServer.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {/* Table Status / Bill Total Pill */}
                  <div className="w-full text-center pointer-events-none">
                    {hasItems && billAmount > 0 ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 text-[11px] font-mono font-bold block truncate shadow-sm">
                        {settings.currencySymbol}{billAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className={`text-[10px] uppercase font-mono tracking-wider block ${
                        table.status === 'occupied' ? 'text-zinc-300 font-semibold' : 'text-zinc-500'
                      }`}>
                        {table.status}
                      </span>
                    )}
                  </div>

                  {/* Edit Mode Drag Grip */}
                  {isEditMode && (
                    <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg font-bold">
                      <Move className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Empty Canvas Message */}
            {tables.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                <Layers className="w-10 h-10 stroke-1 mb-3 text-zinc-700" />
                <p className="text-sm">No tables configured. Switch to Edit Mode to map your venue floor plan.</p>
              </div>
            )}
          </div>
        ) : (
          /* Table Grid / List View - Touch Optimized Cards */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredTables.map(table => {
                const isSelected = selectedTable?.id === table.id;
                const orderForTable = openOrders[table.id];
                const billAmount = orderForTable ? orderForTable.totalAmount : 0;
                const itemCount = orderForTable ? orderForTable.items.reduce((s, i) => s + i.quantity, 0) : 0;

                return (
                  <div
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                      isSelected
                        ? 'bg-zinc-800/90 border-amber-400 ring-2 ring-amber-400 ring-offset-2 ring-offset-black shadow-xl'
                        : table.status === 'occupied'
                        ? 'bg-[#18181c] border-zinc-700 hover:border-zinc-500'
                        : 'bg-[#121215] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Row: Name, Section & Capacity */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-bold text-white tracking-tight">
                          {table.tableName}
                        </span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
                          <Users className="w-3.5 h-3.5" />
                          <span>{table.seats} seats</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-mono">{table.section}</span>
                        {table.assignedServer && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-300 font-medium">Server: {table.assignedServer}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Middle: Open Tab Information */}
                    <div className="my-3 py-2 border-t border-b border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          table.status === 'occupied' ? 'bg-emerald-400' :
                          table.status === 'billed' ? 'bg-amber-400' : 'bg-zinc-600'
                        }`} />
                        <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                          {table.status} ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                        </span>
                      </div>

                      <span className={`text-base font-bold font-mono tabular ${
                        billAmount > 0 ? 'text-amber-400' : 'text-zinc-600'
                      }`}>
                        {settings.currencySymbol}{billAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Bottom Action Buttons - Large Touch Targets */}
                    <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleTakeOrderForTable(table)}
                        className="flex-1 h-10 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Take Order</span>
                      </button>

                      {itemCount > 0 && (
                        <button
                          onClick={() => {
                            selectTable(table);
                            switchTab('total');
                          }}
                          className="h-10 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          title="View Tab & Checkout"
                        >
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span>Pay</span>
                        </button>
                      )}

                      {table.status !== 'empty' && (
                        <button
                          onClick={() => handleClearTable(table.id)}
                          className="h-10 px-3 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/30 text-xs transition-all"
                          title="Clear / Free Table"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Table Quick Action Bar (Bottom Drawer on Floor Plan) */}
        <AnimatePresence>
          {selectedTable && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="p-3 sm:p-4 bg-[#151518] border-t border-zinc-800 shadow-2xl flex flex-wrap items-center justify-between gap-3 shrink-0 z-30"
            >
              {/* Table Info Badge */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex flex-col items-center justify-center text-amber-400 font-bold shadow-inner">
                  <span className="text-xs font-mono">{selectedTable.section.slice(0, 3)}</span>
                  <span className="text-sm leading-none">{selectedTable.tableName.replace(/[^0-9]/g, '') || selectedTable.tableName.slice(0, 3)}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">{selectedTable.tableName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {selectedTable.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedTable.section} • {selectedTable.seats} seats • {selectedTableItemCount} items on tab
                  </p>
                </div>
              </div>

              {/* Total & Action Buttons - Large Touch Targets */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right pr-2">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">Active Tab</span>
                  <span className="text-lg font-bold font-mono text-amber-400 tabular">
                    {settings.currencySymbol}{selectedTableTotal.toFixed(2)}
                  </span>
                </div>

                {/* Direct Order Button */}
                <button
                  id="open-menu-for-table-btn"
                  onClick={() => handleTakeOrderForTable(selectedTable)}
                  className="h-12 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-md active:scale-[0.98] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Take Order</span>
                </button>

                {/* Settle Bill Button */}
                {selectedTableItemCount > 0 && (
                  <button
                    onClick={() => {
                      switchTab('total');
                    }}
                    className="h-12 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-md active:scale-[0.98] transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Bill</span>
                  </button>
                )}

                {/* Clear Table Button */}
                {selectedTable.status !== 'empty' && (
                  <button
                    onClick={() => handleClearTable(selectedTable.id)}
                    className="h-12 px-3.5 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Clear Table & Reset Status"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Free Table</span>
                  </button>
                )}

                {/* Unselect / Switch to Walk-up */}
                <button
                  onClick={() => selectTable(null)}
                  className="h-12 w-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
                  title="Close Selection"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table Edit Configuration Modal (Edit Mode) */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70 p-4">
          <div className="w-full max-w-sm bg-[#18181c] rounded-2xl p-5 border border-zinc-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit {editingTable.tableName}</h3>
              <button onClick={() => setEditingTable(null)} className="h-9 w-9 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Table Name</label>
                <input
                  type="text"
                  value={editingTable.tableName}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingTable(prev => prev ? { ...prev, tableName: val } : null);
                    updateTableDetails(editingTable.id, { tableName: val });
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Section</label>
                <select
                  value={editingTable.section}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingTable(prev => prev ? { ...prev, section: val } : null);
                    updateTableDetails(editingTable.id, { section: val });
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                >
                  <option value="Main Bar">Main Bar</option>
                  <option value="Dining Hall">Dining Hall</option>
                  <option value="Lounge">Lounge</option>
                  <option value="Patio">Patio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Shape</label>
                  <select
                    value={editingTable.shape}
                    onChange={e => {
                      const val = e.target.value as any;
                      setEditingTable(prev => prev ? { ...prev, shape: val } : null);
                      updateTableDetails(editingTable.id, { shape: val });
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="booth">Booth</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingTable.seats}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 4;
                      setEditingTable(prev => prev ? { ...prev, seats: val } : null);
                      updateTableDetails(editingTable.id, { seats: val });
                    }}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-800 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete table ${editingTable.tableName}?`)) {
                      deleteTable(editingTable.id);
                      setEditingTable(null);
                    }
                  }}
                  className="h-11 px-4 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="h-11 px-6 rounded-xl bg-zinc-100 text-zinc-950 font-bold text-xs hover:bg-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70 p-4">
          <form onSubmit={handleCreateNewTable} className="w-full max-w-sm bg-[#18181c] rounded-2xl p-5 border border-zinc-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Table</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="h-9 w-9 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Table Name / Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 14, Bar Seat 5"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  autoFocus
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Floor Section</label>
                <select
                  value={newTableSection}
                  onChange={e => setNewTableSection(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                >
                  <option value="Main Bar">Main Bar</option>
                  <option value="Dining Hall">Dining Hall</option>
                  <option value="Lounge">Lounge</option>
                  <option value="Patio">Patio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Shape</label>
                  <select
                    value={newTableShape}
                    onChange={e => setNewTableShape(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="booth">Booth</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 font-mono uppercase text-[10px] tracking-widest">Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTableSeats}
                    onChange={e => setNewTableSeats(parseInt(e.target.value) || 4)}
                    className="w-full h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 shadow-md"
                >
                  Create Table
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
