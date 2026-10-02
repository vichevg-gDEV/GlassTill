import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  DollarSign, 
  Tag, 
  AlertCircle,
  Wine,
  Utensils,
  Coffee,
  ShoppingBag
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product } from '../types';

interface ProductGridProps {
  category: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ category }) => {
  const { 
    products, 
    categories, 
    activeTab, 
    switchTab, 
    addItemToOrder, 
    updateProduct, 
    addProduct, 
    currentUser, 
    settings 
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');
  
  // Quick Add Product modal state (for managers/admins)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [quickName, setQuickName] = useState<string>('');
  const [quickPrice, setQuickPrice] = useState<string>('');
  const [quickSubcategory, setQuickSubcategory] = useState<string>('General');
  const [quickStation, setQuickStation] = useState<'kitchen' | 'bar' | 'aux'>('bar');

  // Custom open item for Aux category
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemPrice, setCustomItemPrice] = useState<string>('');

  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Find the category definition
  const currentCategoryDef = categories.find(c => c.id === category);

  // Subcategories available for this category
  const subcategories = useMemo(() => {
    const list = ['All'];
    if (currentCategoryDef?.subcategories) {
      currentCategoryDef.subcategories.forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    }
    // Also discover from actual products
    products
      .filter(p => p.category === category && p.subcategory)
      .forEach(p => {
        if (p.subcategory && !list.includes(p.subcategory)) {
          list.push(p.subcategory);
        }
      });
    return list;
  }, [category, currentCategoryDef, products]);

  // Filter products by category, active status, search query, subcategory
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.category !== category) return false;
      if (!p.active && !isAdminOrManager) return false;
      
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        const matchesSub = p.subcategory?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesSub) return false;
      }

      if (selectedSubcategory !== 'All' && p.subcategory !== selectedSubcategory) {
        return false;
      }

      return true;
    });
  }, [products, category, isAdminOrManager, searchQuery, selectedSubcategory]);

  // Group products by subcategory for neat visual sections
  const groupedProducts = useMemo(() => {
    if (selectedSubcategory !== 'All') {
      return { [selectedSubcategory]: filteredProducts };
    }

    const groups: { [key: string]: Product[] } = {};
    filteredProducts.forEach(p => {
      const sub = p.subcategory || 'General';
      if (!groups[sub]) groups[sub] = [];
      groups[sub].push(p);
    });

    return groups;
  }, [filteredProducts, selectedSubcategory]);

  // Custom Aux quick charge add
  const handleCustomAuxAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(customItemPrice);
    if (!customItemName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const customProd: Product = {
      id: 'custom_' + Date.now().toString(36),
      name: customItemName.trim(),
      category: 'aux',
      subcategory: 'Custom Charges',
      price: priceNum,
      active: true,
    };

    addItemToOrder(customProd);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  // Quick Add Product Form Submit
  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(quickPrice);
    if (!quickName.trim() || isNaN(priceNum) || priceNum < 0) return;

    const newProd = addProduct({
      name: quickName.trim(),
      category: category,
      subcategory: quickSubcategory.trim() || 'General',
      price: priceNum,
      active: true,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    addItemToOrder(newProd);
    setIsQuickAddOpen(false);
    setQuickName('');
    setQuickPrice('');
  };

  const handleStartEditPrice = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setEditingProductId(product.id);
    setEditPriceInput(product.price.toFixed(2));
  };

  const handleSavePrice = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const priceNum = parseFloat(editPriceInput);
    if (!isNaN(priceNum) && priceNum >= 0) {
      updateProduct(product.id, { price: priceNum });
    }
    setEditingProductId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#0e0e11]">
      {/* Category Bar & Controls - Touch Sized */}
      <div className="p-3 sm:p-4 border-b border-zinc-800 bg-[#121215] flex flex-col gap-3 shrink-0">
        {/* Top Tier: Category Tabs + Search + Admin Action */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
          {/* Category Tabs Switcher - Touch Sized */}
          <div className="flex items-center gap-2 shrink-0">
            {categories.map(cat => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`grid-cat-tab-${cat.id}`}
                  onClick={() => switchTab(cat.id)}
                  className={`h-11 sm:h-12 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                    isActive
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat.destinationStation === 'bar' ? (
                    <Wine className="w-4 h-4" />
                  ) : cat.destinationStation === 'kitchen' ? (
                    <Utensils className="w-4 h-4" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Input - Touch Sized */}
            <div className="relative w-40 sm:w-56 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                id={`product-search-${category}`}
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-8 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-400/80 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Admin Quick Add Product Button */}
            {isAdminOrManager && (
              <button
                onClick={() => {
                  setQuickStation(category === 'drinks' ? 'bar' : 'kitchen');
                  setIsQuickAddOpen(true);
                }}
                className="h-11 px-3.5 sm:px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm"
                title="Add a new product to this category"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Item</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Tier: Subcategories Pills - Large Touch Targets */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
            Filter:
          </span>
          {subcategories.map(sub => (
            <button
              key={sub}
              id={`filter-sub-${sub}`}
              onClick={() => setSelectedSubcategory(sub)}
              className={`h-10 px-3.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedSubcategory === sub
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-6">
        {/* If Aux Tab, display Custom Open-Amount entry card at top */}
        {category === 'aux' && (
          <form
            onSubmit={handleCustomAuxAdd}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 shadow-md"
          >
            <div className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm font-bold">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Quick Custom Charge (Corkage, Cover, Merchandise, Service Fee)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="text"
                placeholder="Description / Reason"
                value={customItemName}
                onChange={e => setCustomItemName(e.target.value)}
                className="flex-1 min-w-[180px] h-11 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-amber-400"
              />
              <div className="relative w-32 sm:w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-mono">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={customItemPrice}
                  onChange={e => setCustomItemPrice(e.target.value)}
                  className="w-full h-11 pl-7 pr-3 rounded-xl bg-zinc-950 border border-zinc-700 text-xs sm:text-sm text-white font-mono outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Charge</span>
              </button>
            </div>
          </form>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <p className="text-sm">No items found matching criteria.</p>
            {isAdminOrManager && (
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="mt-3.5 h-11 px-4 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold hover:bg-amber-400/30 transition-all"
              >
                + Add a product now
              </button>
            )}
          </div>
        ) : (
          Object.keys(groupedProducts).map(subcategoryName => {
            const items = groupedProducts[subcategoryName] || [];
            return (
              <div key={subcategoryName} className="space-y-3">
                {/* Clean Subcategory Header */}
                <div className="flex items-center justify-between px-1 py-1 border-b border-zinc-800/80">
                  <span className="text-xs sm:text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono">
                    {subcategoryName}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Minimalist High-Contrast Touch Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                  {items.map(product => {
                    const isEditing = editingProductId === product.id;

                    return (
                      <div
                        key={product.id}
                        id={`product-card-${product.id}`}
                        onClick={() => {
                          if (!isEditing) addItemToOrder(product);
                        }}
                        className="group relative min-h-[116px] sm:min-h-[126px] p-4 rounded-2xl bg-[#151518] hover:bg-[#1c1c21] border border-zinc-800/80 hover:border-zinc-700 text-left flex flex-col justify-between active:scale-[0.98] transition-all cursor-pointer shadow-md"
                      >
                        {/* Item Name */}
                        <div className="space-y-1">
                          <span className="text-sm sm:text-base leading-snug font-bold text-zinc-100 group-hover:text-white line-clamp-2">
                            {product.name}
                          </span>
                          {product.sku && (
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono block">
                              {product.sku}
                            </span>
                          )}
                        </div>

                        {/* Price & Admin Quick Edit */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 w-full mt-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 w-full" onClick={e => e.stopPropagation()}>
                              <span className="text-xs text-zinc-400 font-mono">{settings.currencySymbol}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={editPriceInput}
                                onChange={e => setEditPriceInput(e.target.value)}
                                autoFocus
                                className="w-20 h-9 px-2 bg-zinc-900 border border-amber-400 rounded-lg text-xs text-white font-mono outline-none"
                              />
                              <button
                                onClick={e => handleSavePrice(e, product)}
                                className="h-9 px-2.5 bg-emerald-500 text-zinc-950 font-bold rounded-lg hover:bg-emerald-400 flex items-center justify-center"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm sm:text-base font-mono font-bold text-amber-400 tabular group-hover:text-amber-300">
                                {settings.currencySymbol}{product.price.toFixed(2)}
                              </span>

                              {isAdminOrManager && (
                                <button
                                  onClick={e => handleStartEditPrice(e, product)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-700/60 rounded-lg text-zinc-400 hover:text-zinc-200 transition-opacity"
                                  title="Quick edit price"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Product Modal (Admin) */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#18181c] border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Add New Product</h3>
                    <p className="text-xs text-zinc-400">Category: <span className="text-amber-400 uppercase font-mono font-semibold">{category}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickAddOpen(false)}
                  className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Margherita, Espresso Martini"
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    autoFocus
                    className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Price ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={quickPrice}
                      onChange={e => setQuickPrice(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white font-mono outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">Subcategory</label>
                    <input
                      type="text"
                      placeholder="e.g. Cocktails, Starters"
                      value={quickSubcategory}
                      onChange={e => setQuickSubcategory(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(false)}
                    className="flex-1 h-12 rounded-xl bg-zinc-800 text-zinc-300 text-xs sm:text-sm font-semibold hover:bg-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md transition-all"
                  >
                    Add & Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
