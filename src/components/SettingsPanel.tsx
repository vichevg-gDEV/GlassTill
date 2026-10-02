import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  Upload, 
  FileText, 
  Check, 
  AlertTriangle, 
  Users, 
  Key, 
  Printer, 
  DollarSign, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  RefreshCw, 
  Lock, 
  FolderKanban,
  Building2,
  Receipt,
  Download,
  ChefHat,
  Wine
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { UserProfile, UserRole } from '../types';
import { AdminMenuManager } from './AdminMenuManager';

export const SettingsPanel: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    profiles, 
    addOrUpdateProfile, 
    deleteProfile, 
    uploadProductsCsv, 
    currentUser,
    playAudioFeedback
  } = usePOS();

  const [activeSection, setActiveSection] = useState<'menu' | 'venue' | 'staff' | 'csv' | 'hardware'>('menu');
  const [csvText, setCsvText] = useState<string>('');
  const [csvResult, setCsvResult] = useState<{ success: boolean; addedCount: number; errors: string[] } | null>(null);
  
  // Hardware test states
  const [printerTesting, setPrinterTesting] = useState<boolean>(false);
  const [drawerTesting, setDrawerTesting] = useState<boolean>(false);

  // New Employee Form
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffPin, setNewStaffPin] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('emp');
  const [staffError, setStaffError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'admin';
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (!isManagerOrAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-[#09090b]">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 text-zinc-500">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-base font-medium text-white">Access Restricted</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          Venue Settings and Product Management are restricted to Floor Managers and Venue Admins.
        </p>
      </div>
    );
  }

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
        const res = uploadProductsCsv(text);
        setCsvResult(res);
      }
    };
    reader.readAsText(file);
  };

  const handleManualCsvIngest = () => {
    if (!csvText.trim()) return;
    const res = uploadProductsCsv(csvText);
    setCsvResult(res);
  };

  const handleLoadSampleCsv = () => {
    const sample = `Item Name,Category,Price,SKU,Subcategory
Hibiscus Mezcal Sour,drinks,17.50,CK-08,Cocktails
Japanese Yuzu Highball,drinks,15.00,CK-09,Cocktails
Crispy Brussels Sprouts with Pancetta,food,16.00,FD-20,Starters
A5 Wagyu Beef Skewers,food,28.00,FD-21,Small Plates
Truffle Porcini Risotto,food,30.00,FD-22,Mains
Artisanal Canvas Tote Bag,aux,25.00,AUX-09,Merchandise
VIP Table Bottle Service Fee,aux,75.00,AUX-10,Services`;
    setCsvText(sample);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');

    if (!newStaffName.trim()) {
      setStaffError('Please enter an employee name');
      return;
    }
    if (!/^\d{5}$/.test(newStaffPin)) {
      setStaffError('PIN must be exactly 5 digits');
      return;
    }
    if (profiles.some(p => p.pin === newStaffPin)) {
      setStaffError('This 5-digit PIN is already assigned to another user');
      return;
    }

    const newProfile: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      displayName: newStaffName.trim(),
      pin: newStaffPin,
      role: newStaffRole,
      createdAt: new Date().toISOString(),
    };

    addOrUpdateProfile(newProfile);
    setNewStaffName('');
    setNewStaffPin('');
    setNewStaffRole('emp');
  };

  const handleTestPrinter = () => {
    setPrinterTesting(true);
    playAudioFeedback('success');
    setTimeout(() => {
      setPrinterTesting(false);
    }, 1500);
  };

  const handleTestDrawer = () => {
    setDrawerTesting(true);
    playAudioFeedback('bell');
    setTimeout(() => {
      setDrawerTesting(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none bg-[#09090b] font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="p-3.5 border-b border-zinc-800 bg-[#121215] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Venue Administration & Settings
            </h1>
            <p className="text-[11px] text-zinc-400">
              Manage product pricing, staff PIN security, venue taxes, and hardware.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSection('menu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'menu'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Menu & Pricing</span>
          </button>

          <button
            onClick={() => setActiveSection('venue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'venue'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Venue & Taxes</span>
          </button>

          <button
            onClick={() => setActiveSection('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'staff'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff & PINs</span>
          </button>

          <button
            onClick={() => setActiveSection('csv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'csv'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Import</span>
          </button>

          <button
            onClick={() => setActiveSection('hardware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSection === 'hardware'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Hardware</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto">
        {/* 1. Menu & Pricing Catalog Editor */}
        {activeSection === 'menu' && (
          <div className="h-full flex flex-col">
            <AdminMenuManager />
          </div>
        )}

        {/* 2. Venue & Tax Configurations */}
        {activeSection === 'venue' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Venue Business Profile & Localization
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Venue / Bar Name</label>
                  <input
                    type="text"
                    value={settings.venueName}
                    onChange={e => updateSettings({ venueName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={e => updateSettings({ currencySymbol: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Sales Tax Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={(settings.taxRate * 100).toFixed(2)}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateSettings({ taxRate: val / 100 });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Auto-Lock Inactivity (Seconds)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={settings.autoLockSeconds}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) updateSettings({ autoLockSeconds: val });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  value={settings.receiptFooter}
                  onChange={e => updateSettings({ receiptFooter: e.target.value })}
                  placeholder="e.g. Thank you for dining with us! Follow @lumagrill"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Toggles */}
              <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSettings({ soundFeedback: !settings.soundFeedback })}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      settings.soundFeedback
                        ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {settings.soundFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>Audio Beep Feedback: {settings.soundFeedback ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                    className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all"
                  >
                    {settings.theme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span>Theme: {settings.theme.toUpperCase()}</span>
                  </button>
                </div>

                <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5" /> Changes saved automatically
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Staff & PIN Security Management */}
        {activeSection === 'staff' && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
            {/* Add Employee Card */}
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add Staff Member / Station Terminal
              </h2>

              {staffError && (
                <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{staffError}</span>
                </div>
              )}

              <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Staff / Terminal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marco, Bar Display"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">5-Digit PIN Code</label>
                  <input
                    type="password"
                    maxLength={5}
                    required
                    placeholder="•••••"
                    value={newStaffPin}
                    onChange={e => setNewStaffPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono text-center tracking-widest outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Assigned Role</label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="emp">Emp (Front of House Server)</option>
                    <option value="kitchen">Kitchen Display KDS</option>
                    <option value="bar">Bar Display KDS</option>
                    <option value="manager">Floor Manager</option>
                    <option value="admin">Admin / Owner</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 shadow-sm transition-all"
                >
                  Create Staff PIN
                </button>
              </form>
            </div>

            {/* Existing Staff Profiles Table */}
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Active Staff Directory & Access Credentials ({profiles.length})
                </span>
                <span className="text-xs font-mono text-zinc-500 font-normal">
                  All PINs: 5 Digits
                </span>
              </h2>

              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#09090b]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 font-mono uppercase text-[10px]">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 font-mono">PIN Code</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {profiles.map(profile => (
                      <tr key={profile.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-white flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white uppercase ${
                            profile.role === 'admin' ? 'bg-amber-600' :
                            profile.role === 'manager' ? 'bg-blue-600' :
                            profile.role === 'kitchen' ? 'bg-orange-600' :
                            profile.role === 'bar' ? 'bg-cyan-600' : 'bg-zinc-700'
                          }`}>
                            {profile.displayName.slice(0, 1)}
                          </div>
                          <span>{profile.displayName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            profile.role === 'admin' ? 'bg-amber-500/20 text-amber-300' :
                            profile.role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                            profile.role === 'kitchen' ? 'bg-orange-500/20 text-orange-300' :
                            profile.role === 'bar' ? 'bg-cyan-500/20 text-cyan-300' :
                            'bg-zinc-800 text-zinc-300'
                          }`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-400">
                          ••••• <span className="text-zinc-600 text-[10px]">({profile.pin})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {profiles.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Remove user "${profile.displayName}"?`)) {
                                  deleteProfile(profile.id);
                                }
                              }}
                              className="p-1 hover:bg-rose-500/20 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. CSV Import & Export */}
        {activeSection === 'csv' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    Bulk Menu CSV Ingestion
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Import existing spreadsheets. Format: Item Name, Category, Price, SKU, Subcategory
                  </p>
                </div>

                <button
                  onClick={handleLoadSampleCsv}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Load Sample Data
                </button>
              </div>

              {csvResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  csvResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {csvResult.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-semibold">
                      {csvResult.success ? `Successfully imported ${csvResult.addedCount} items!` : 'CSV Import Issues'}
                    </span>
                    {csvResult.errors.length > 0 && (
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-zinc-300">
                        {csvResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div>
                <textarea
                  rows={8}
                  placeholder="Paste CSV text here..."
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Choose .CSV File</span>
                  </button>
                </div>

                <button
                  onClick={handleManualCsvIngest}
                  disabled={!csvText.trim()}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    csvText.trim()
                      ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-md cursor-pointer'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  Import Products Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Hardware & Printers */}
        {activeSection === 'hardware' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                Receipt Printers & Cash Drawer Integration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Receipt Printer Network IP</label>
                  <input
                    type="text"
                    value={settings.printerIp}
                    onChange={e => updateSettings({ printerIp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Cash Drawer Status</label>
                  <button
                    onClick={() => updateSettings({ cashDrawerEnabled: !settings.cashDrawerEnabled })}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
                      settings.cashDrawerEnabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <span>Auto-Kick Drawer on Cash:</span>
                    <span className="font-bold">{settings.cashDrawerEnabled ? 'ENABLED' : 'DISABLED'}</span>
                  </button>
                </div>
              </div>

              {/* Hardware Test Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
                <button
                  onClick={handleTestPrinter}
                  disabled={printerTesting}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>{printerTesting ? 'Printing Test Slip...' : 'Test Print Slip'}</span>
                </button>

                <button
                  onClick={handleTestDrawer}
                  disabled={drawerTesting}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{drawerTesting ? 'Kicking Drawer Pulse...' : 'Test Drawer Kick'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
