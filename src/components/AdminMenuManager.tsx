import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Tag, 
  Utensils, 
  Wine, 
  Search, 
  DollarSign, 
  FolderPlus, 
  Layers, 
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { Product, MenuCategoryTab } from '../types';

export const AdminMenuManager: React.FC = () => {
  const { 
    categories, 
    products, 
    addCategoryTab, 
    updateCategoryTab, 
    deleteCategoryTab, 
    addSubcategoryToCategory,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductActive,
    settings,
    currentUser
  } = usePOS();

  const [activeTabId, setActiveTabId] = useState<string>(categories[0]?.id || 'drinks');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('all');

  // New Category Modal State
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatStation, setNewCatStation] = useState<'kitchen' | 'bar' | 'aux'>('kitchen');
  const [newCatSubcategories, setNewCatSubcategories] = useState<string>('General');

  // Subcategory Input State for active category
  const [newSubcategoryInput, setNewSubcategoryInput] = useState<string>('');
  const [showAddSubcatInput, setShowAddSubcatInput] = useState<boolean>(false);

  // New / Edit Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodFormName, setProdFormName] = useState<string>('');
  const [prodFormCategory, setProdFormCategory] = useState<string>(activeTabId);
  const [prodFormSubcategory, setProdFormSubcategory] = useState<string>('');
  const [prodFormPrice, setProdFormPrice] = useState<string>('');
  const [prodFormSku, setProdFormSku] = useState<string>('');
  const [prodFormStation, setProdFormStation] = useState<'kitchen' | 'bar' | 'aux'>('kitchen');
  const [prodError, setProdError] = useState<string>('');

  // Inline Price Edit State
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState<string>('');

  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeTabId) || categories[0];
  }, [categories, activeTabId]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = p.category === activeTabId;
      const matchSub = selectedSubcategoryFilter === 'all' || p.subcategory === selectedSubcategoryFilter;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSub && matchSearch;
    });
  }, [products, activeTabId, selectedSubcategoryFilter, searchQuery]);

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormCategory(activeTabId);
    setProdFormSubcategory(activeCategory?.subcategories[0] || 'General');
    setProdFormPrice('');
    setProdFormSku('');
    setProdFormStation(activeCategory?.destinationStation || 'kitchen');
    setProdError('');
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdFormName(prod.name);
    setProdFormCategory(prod.category);
    setProdFormSubcategory(prod.subcategory || 'General');
    setProdFormPrice(prod.price.toString());
    setProdFormSku(prod.sku || '');
    setProdFormStation(prod.destinationStation || (prod.category === 'drinks' ? 'bar' : 'kitchen'));
    setProdError('');
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProdError('');

    const priceNum = parseFloat(prodFormPrice);
    if (!prodFormName.trim()) {
      setProdError('Please enter a product name');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setProdError('Please enter a valid price');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: prodFormName.trim(),
        category: prodFormCategory,
        subcategory: prodFormSubcategory.trim() || 'General',
        price: priceNum,
        sku: prodFormSku.trim() || undefined,
        destinationStation: prodFormStation,
      });
    } else {
      addProduct({
        name: prodFormName.trim(),
        category: prodFormCategory,
        subcategory: prodFormSubcategory.trim() || 'General',
        price: priceNum,
        active: true,
        sku: prodFormSku.trim() || undefined,
        destinationStation: prodFormStation,
      });
    }

    setIsProductModalOpen(false);
  };

  // Handle Add Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const subs = newCatSubcategories.split(',').map(s => s.trim()).filter(Boolean);
    const created = addCategoryTab({
      name: newCatName.trim(),
      destinationStation: newCatStation,
      subcategories: subs.length > 0 ? subs : ['General'],
    });

    setActiveTabId(created.id);
    setIsAddingCategory(false);
    setNewCatName('');
    setNewCatSubcategories('General');
  };

  // Handle Add Subcategory
  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryInput.trim() || !activeCategory) return;
    addSubcategoryToCategory(activeCategory.id, newSubcategoryInput.trim());
    setNewSubcategoryInput('');
    setShowAddSubcatInput(false);
  };

  // Inline Price Edit
  const handleSaveInlinePrice = (productId: string) => {
    const pNum = parseFloat(inlinePriceVal);
    if (!isNaN(pNum) && pNum >= 0) {
      updateProduct(productId, { price: pNum });
    }
    setInlineEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#09090b] font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="p-3.5 border-b border-zinc-800 bg-[#121215] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Menu & Product Catalog Manager
            </h1>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Add items, edit prices, configure categories, and route to Kitchen or Bar KDS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Category Button */}
          <button
            onClick={() => setIsAddingCategory(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Category</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAddProduct}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="px-3.5 py-2 border-b border-zinc-800 bg-[#151518] flex items-center justify-between gap-3 shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          {categories.map(cat => {
            const isActive = activeTabId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTabId(cat.id);
                  setSelectedSubcategoryFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.destinationStation === 'bar' ? (
                  <Wine className="w-3.5 h-3.5" />
                ) : cat.destinationStation === 'kitchen' ? (
                  <Utensils className="w-3.5 h-3.5" />
                ) : (
                  <Tag className="w-3.5 h-3.5" />
                )}
                <span>{cat.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {products.filter(p => p.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Station Routing Badge for Selected Category */}
        {activeCategory && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono shrink-0">
            <span className="text-[10px] uppercase text-zinc-500">Destination:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
              activeCategory.destinationStation === 'kitchen' 
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30' 
                : activeCategory.destinationStation === 'bar'
                ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {activeCategory.destinationStation}
            </span>
          </div>
        )}
      </div>

      {/* Subcategory Filter & Search Bar */}
      <div className="px-3.5 py-2 border-b border-zinc-800/80 bg-[#121215] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        {/* Subcategories Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono uppercase text-zinc-500 shrink-0">Sub:</span>
          <button
            onClick={() => setSelectedSubcategoryFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap ${
              selectedSubcategoryFilter === 'all'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All ({products.filter(p => p.category === activeTabId).length})
          </button>

          {activeCategory?.subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategoryFilter(sub)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap ${
                selectedSubcategoryFilter === sub
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {sub} ({products.filter(p => p.category === activeTabId && p.subcategory === sub).length})
            </button>
          ))}

          {/* Add Subcategory Trigger */}
          {showAddSubcatInput ? (
            <form onSubmit={handleAddSubcategory} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="New subcategory"
                value={newSubcategoryInput}
                onChange={e => setNewSubcategoryInput(e.target.value)}
                autoFocus
                className="w-28 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-xs text-white outline-none"
              />
              <button
                type="submit"
                className="p-1 bg-emerald-500 text-zinc-950 rounded hover:bg-emerald-400 text-xs"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setShowAddSubcatInput(false)}
                className="p-1 bg-zinc-800 text-zinc-400 rounded hover:text-white text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddSubcatInput(true)}
              className="px-2 py-0.5 rounded border border-dashed border-zinc-700 hover:border-zinc-500 text-[11px] text-zinc-400 hover:text-white whitespace-nowrap"
            >
              + Subcategory
            </button>
          )}
        </div>

        {/* Search Products */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search items or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Main Table / Product List */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
            <Layers className="w-10 h-10 stroke-1 text-zinc-700" />
            <div>
              <p className="text-sm font-medium text-zinc-400">No products found in this category</p>
              <p className="text-xs text-zinc-600 mt-0.5">Click "Add Product" above to create your first item</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs hover:bg-amber-300"
            >
              + Add Product Now
            </button>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#121215]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Subcategory</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">Destination</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredProducts.map(product => {
                  const isInlineEditing = inlineEditingId === product.id;

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        !product.active ? 'opacity-50 bg-zinc-950/40' : ''
                      }`}
                    >
                      {/* Name & SKU */}
                      <td className="py-2.5 px-3 font-medium text-zinc-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{product.name}</span>
                          {product.sku && (
                            <span className="text-[10px] font-mono text-zinc-500">{product.sku}</span>
                          )}
                        </div>
                      </td>

                      {/* Subcategory */}
                      <td className="py-2.5 px-3 text-zinc-400 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                          {product.subcategory || 'General'}
                        </span>
                      </td>

                      {/* Destination Station */}
                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase ${
                          product.destinationStation === 'bar'
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                            : product.destinationStation === 'kitchen'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {product.destinationStation || 'station'}
                        </span>
                      </td>

                      {/* Price (Click to Edit) */}
                      <td className="py-2.5 px-3 font-mono font-bold">
                        {isInlineEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-zinc-500">{settings.currencySymbol}</span>
                            <input
                              type="number"
                              step="0.01"
                              value={inlinePriceVal}
                              onChange={e => setInlinePriceVal(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveInlinePrice(product.id)}
                              autoFocus
                              className="w-16 px-1.5 py-0.5 bg-zinc-950 border border-amber-400 rounded text-xs text-white outline-none"
                            />
                            <button
                              onClick={() => handleSaveInlinePrice(product.id)}
                              className="p-1 bg-emerald-500 text-zinc-950 rounded hover:bg-emerald-400"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setInlineEditingId(product.id);
                              setInlinePriceVal(product.price.toString());
                            }}
                            className="px-2 py-0.5 rounded hover:bg-zinc-800 text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
                            title="Click to edit price"
                          >
                            <span>{settings.currencySymbol}{product.price.toFixed(2)}</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-zinc-400" />
                          </button>
                        )}
                      </td>

                      {/* Active / 86'd toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => toggleProductActive(product.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-all ${
                            product.active
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          }`}
                          title="Click to toggle availability"
                        >
                          {product.active ? 'AVAILABLE' : "86'D (OFF)"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditProduct(product)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/50 text-zinc-400 hover:text-rose-300 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#18181c] border border-zinc-700 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    {editingProduct ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <p className="text-[11px] text-zinc-400">Configure item name, price, category, and station</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {prodError && (
                <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{prodError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wagyu Ribeye Steak, Classic Negroni"
                    value={prodFormName}
                    onChange={e => setProdFormName(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Price ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={prodFormPrice}
                      onChange={e => setProdFormPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Category</label>
                    <select
                      value={prodFormCategory}
                      onChange={e => {
                        const newCat = e.target.value;
                        setProdFormCategory(newCat);
                        const catObj = categories.find(c => c.id === newCat);
                        if (catObj) {
                          setProdFormStation(catObj.destinationStation);
                          setProdFormSubcategory(catObj.subcategories[0] || 'General');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Subcategory</label>
                    <input
                      type="text"
                      placeholder="e.g. Starters, Cocktails"
                      value={prodFormSubcategory}
                      onChange={e => setProdFormSubcategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">SKU / Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. FD-01"
                      value={prodFormSku}
                      onChange={e => setProdFormSku(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Destination Station</label>
                  <select
                    value={prodFormStation}
                    onChange={e => setProdFormStation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="kitchen">Kitchen KDS (Chef / Cook Ticket)</option>
                    <option value="bar">Bar Mixology (Bartender Drink Ticket)</option>
                    <option value="aux">Auxiliary (No Ticket Dispatch)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-400 text-zinc-950 text-xs font-bold hover:bg-amber-300 shadow-md"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Category Modal */}
      <AnimatePresence>
        {isAddingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#18181c] border border-zinc-700 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Create New Category</h3>
                    <p className="text-[11px] text-zinc-400">Add a new tab to the POS ordering menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Category Tab Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desserts, Wine List, Retail Merchandise"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Destination Station</label>
                  <select
                    value={newCatStation}
                    onChange={e => setNewCatStation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="kitchen">Kitchen (Routes items to Chef KDS)</option>
                    <option value="bar">Bar (Routes items to Bartender Display)</option>
                    <option value="aux">Auxiliary (No Ticket Dispatch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Initial Subcategories (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cakes, Pastries, Ice Cream"
                    value={newCatSubcategories}
                    onChange={e => setNewCatSubcategories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-400 text-zinc-950 text-xs font-bold hover:bg-amber-300 shadow-md"
                  >
                    Create Category Tab
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
