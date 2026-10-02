import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserProfile, 
  Product, 
  VenueTable, 
  Order, 
  OrderItem, 
  StationTicket,
  TabType, 
  VenueSettings, 
  SyncMessage,
  MenuCategoryTab
} from '../types';
import { 
  INITIAL_PROFILES, 
  INITIAL_PRODUCTS, 
  INITIAL_TABLES, 
  INITIAL_SETTINGS, 
  SEED_HISTORICAL_ORDERS,
  INITIAL_CATEGORIES
} from '../mockData';

export interface SubmitOrderResult {
  success: boolean;
  message: string;
  foodCount: number;
  drinkCount: number;
  auxCount: number;
  totalSubmitted: number;
}

interface POSContextType {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  categories: MenuCategoryTab[];
  activeTab: TabType;
  selectedTable: VenueTable | null;
  activeOrder: Order;
  openOrders: Record<string, Order>;
  stationTickets: StationTicket[];
  tables: VenueTable[];
  products: Product[];
  ordersHistory: Order[];
  settings: VenueSettings;
  syncStatus: 'synced' | 'syncing' | 'offline';
  soundEnabled: boolean;
  lastSubmissionNotice: { text: string; foodCount: number; drinkCount: number; timestamp: number } | null;
  isStationMonitorOpen: boolean;
  setIsStationMonitorOpen: (open: boolean) => void;
  
  // Actions
  unlockWithPin: (pin: string) => boolean;
  lockTill: () => void;
  switchTab: (tab: TabType) => void;
  selectTable: (table: VenueTable | null) => void;
  addItemToOrder: (product: Product, quantity?: number, customPrice?: number, note?: string) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, delta: number) => void;
  updateItemNote: (itemId: string, note: string) => void;
  submitActiveOrder: () => SubmitOrderResult;
  clearActiveOrder: () => void;
  checkoutActiveOrder: (paymentMethod: 'card' | 'cash' | 'split' | 'tab', tipAmount?: number, splitCount?: number) => Order;
  
  // Station Dispatch & Reply Actions
  updateStationTicketStatus: (ticketId: string, status: StationTicket['status']) => void;
  replyToStationTicket: (ticketId: string, replyMessage: string, newStatus?: StationTicket['status']) => void;
  clearCompletedStationTickets: () => void;

  // Management actions
  updateTableLayout: (tableId: string, posX: number, posY: number) => void;
  addTable: (table: Omit<VenueTable, 'id' | 'status'>) => void;
  deleteTable: (tableId: string) => void;
  updateTableDetails: (tableId: string, updates: Partial<VenueTable>) => void;
  
  // Category & Menu Management
  addCategoryTab: (tab: { name: string; destinationStation: 'kitchen' | 'bar' | 'aux'; subcategories?: string[]; icon?: string }) => MenuCategoryTab;
  addSubcategoryToCategory: (categoryId: string, subcategoryName: string) => void;
  updateCategoryTab: (categoryId: string, updates: Partial<MenuCategoryTab>) => void;
  deleteCategoryTab: (categoryId: string) => void;

  // Product management
  uploadProductsCsv: (csvText: string) => { success: boolean; addedCount: number; errors: string[] };
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  toggleProductActive: (productId: string) => void;
  
  // Profile & Settings
  addOrUpdateProfile: (profile: UserProfile) => void;
  deleteProfile: (profileId: string) => void;
  updateSettings: (newSettings: Partial<VenueSettings>) => void;
  
  // Feedback
  playAudioFeedback: (type: 'tap' | 'add' | 'success' | 'error' | 'bell') => void;
  clearSubmissionNotice: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILES: 'lumatill_profiles_v2',
  CATEGORIES: 'lumatill_categories_v2',
  PRODUCTS: 'lumatill_products_v2',
  TABLES: 'lumatill_tables_v2',
  SETTINGS: 'lumatill_settings_v2',
  ORDERS: 'lumatill_orders_v2',
  OPEN_ORDERS: 'lumatill_open_orders_v2',
  STATION_TICKETS: 'lumatill_station_tickets_v2',
};

const TILL_ID = 'till_' + Math.random().toString(36).substring(2, 9);

const INITIAL_OPEN_ORDERS: Record<string, Order> = {
  tbl_d1: {
    id: 'ord_tbl_d1',
    tableId: 'tbl_d1',
    tableName: 'Table 10',
    openedBy: 'user_emp_01',
    openedByName: 'Sarah Jenkins',
    openedByRole: 'emp',
    submittedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    items: [
      { id: 'it_seed_1', productId: 'fd_06', name: 'Wagyu Smash Burger & Brioche', category: 'food', quantity: 2, priceAtTime: 24.00, note: 'Medium rare', addedAt: new Date(Date.now() - 10 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 8 * 60000).toISOString(), destination: 'kitchen' },
      { id: 'it_seed_2', productId: 'fd_01', name: 'Hand-Cut Truffle Fries & Aioli', category: 'food', quantity: 1, priceAtTime: 14.00, note: 'Extra dip', addedAt: new Date(Date.now() - 10 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 8 * 60000).toISOString(), destination: 'kitchen' },
      { id: 'it_seed_3', productId: 'drk_02', name: 'Yuzu Paloma', category: 'drinks', quantity: 2, priceAtTime: 16.50, addedAt: new Date(Date.now() - 10 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 8 * 60000).toISOString(), destination: 'bar' },
    ],
    subtotal: 95.00,
    taxAmount: 8.43,
    tipAmount: 0,
    totalAmount: 103.43,
    isClosed: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  tbl_b1: {
    id: 'ord_tbl_b1',
    tableId: 'tbl_b1',
    tableName: 'Bar 01',
    openedBy: 'user_emp_01',
    openedByName: 'Sarah Jenkins',
    openedByRole: 'emp',
    submittedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    items: [
      { id: 'it_seed_4', productId: 'drk_01', name: 'Smoked Old Fashioned', category: 'drinks', quantity: 2, priceAtTime: 18.00, addedAt: new Date(Date.now() - 15 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 15 * 60000).toISOString(), destination: 'bar' },
    ],
    subtotal: 36.00,
    taxAmount: 3.20,
    tipAmount: 0,
    totalAmount: 39.20,
    isClosed: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  tbl_d4: {
    id: 'ord_tbl_d4',
    tableId: 'tbl_d4',
    tableName: 'Table 14',
    openedBy: 'user_emp_02',
    openedByName: 'Marcus Thorne',
    openedByRole: 'emp',
    submittedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    items: [
      { id: 'it_seed_5', productId: 'fd_09', name: 'Prime 12oz Dry-Aged Ribeye', category: 'food', quantity: 2, priceAtTime: 54.00, note: 'Medium', addedAt: new Date(Date.now() - 6 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 4 * 60000).toISOString(), destination: 'kitchen' },
      { id: 'it_seed_6', productId: 'drk_14', name: 'Oregon Willamette Pinot Noir', category: 'drinks', quantity: 4, priceAtTime: 16.50, addedAt: new Date(Date.now() - 6 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 4 * 60000).toISOString(), destination: 'bar' },
    ],
    subtotal: 174.00,
    taxAmount: 15.44,
    tipAmount: 0,
    totalAmount: 189.44,
    isClosed: false,
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  tbl_l1: {
    id: 'ord_tbl_l1',
    tableId: 'tbl_l1',
    tableName: 'Booth A',
    openedBy: 'user_mgr_01',
    openedByName: 'Elena Rostova',
    openedByRole: 'manager',
    submittedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    items: [
      { id: 'it_seed_7', productId: 'fd_02', name: 'Hamachi Crudo, Ponzu, Finger Lime', category: 'food', quantity: 2, priceAtTime: 21.00, addedAt: new Date(Date.now() - 15 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 12 * 60000).toISOString(), destination: 'kitchen' },
      { id: 'it_seed_8', productId: 'drk_04', name: 'Oaxacan Mezcal Negroni', category: 'drinks', quantity: 3, priceAtTime: 18.50, addedAt: new Date(Date.now() - 15 * 60000).toISOString(), status: 'submitted', submittedAt: new Date(Date.now() - 12 * 60000).toISOString(), destination: 'bar' },
    ],
    subtotal: 97.50,
    taxAmount: 8.65,
    tipAmount: 0,
    totalAmount: 106.15,
    isClosed: false,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  }
};

const INITIAL_STATION_TICKETS: StationTicket[] = [
  {
    id: 'st_k_01',
    orderId: 'ord_tbl_d1',
    tableId: 'tbl_d1',
    tableName: 'Table 10',
    serverName: 'Sarah Jenkins',
    station: 'kitchen',
    submittedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'preparing',
    prepStartTime: new Date(Date.now() - 6 * 60000).toISOString(),
    replyMessage: 'Burger on the grill, 4 mins out',
    replyTimestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [
      { itemId: 'it_seed_1', name: 'Wagyu Smash Burger & Brioche', quantity: 2, category: 'food', note: 'Medium rare' },
      { itemId: 'it_seed_2', name: 'Hand-Cut Truffle Fries & Aioli', quantity: 1, category: 'food', note: 'Extra dip' },
    ],
  },
  {
    id: 'st_b_01',
    orderId: 'ord_tbl_d1',
    tableId: 'tbl_d1',
    tableName: 'Table 10',
    serverName: 'Sarah Jenkins',
    station: 'bar',
    submittedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'ready',
    readyTime: new Date(Date.now() - 3 * 60000).toISOString(),
    replyMessage: 'Palomas ready at service well',
    replyTimestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    items: [
      { itemId: 'it_seed_3', name: 'Yuzu Paloma', quantity: 2, category: 'drinks' },
    ],
  },
  {
    id: 'st_b_02',
    orderId: 'ord_tbl_b1',
    tableId: 'tbl_b1',
    tableName: 'Bar 01',
    serverName: 'Sarah Jenkins',
    station: 'bar',
    submittedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'completed',
    items: [
      { itemId: 'it_seed_4', name: 'Smoked Old Fashioned', quantity: 2, category: 'drinks' },
    ],
  },
  {
    id: 'st_k_02',
    orderId: 'ord_tbl_d4',
    tableId: 'tbl_d4',
    tableName: 'Table 14',
    serverName: 'Marcus Thorne',
    station: 'kitchen',
    submittedAt: new Date(Date.now() - 4 * 60000).toISOString(),
    status: 'preparing',
    prepStartTime: new Date(Date.now() - 3 * 60000).toISOString(),
    replyMessage: 'Ribeyes resting, plating shortly',
    replyTimestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    items: [
      { itemId: 'it_seed_5', name: 'Prime 12oz Dry-Aged Ribeye', quantity: 2, category: 'food', note: 'Medium' },
    ],
  },
];

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Audio Synthesis for haptic audio
  const playAudioFeedback = useCallback((type: 'tap' | 'add' | 'success' | 'error' | 'bell') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'add') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.1); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now); // C6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }, []);

  // Initialize state from local storage or seeds
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES) || localStorage.getItem('glasstill_profiles_v1');
      return saved ? JSON.parse(saved) : INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [categories, setCategories] = useState<MenuCategoryTab[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || localStorage.getItem('glasstill_products_v1');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [tables, setTables] = useState<VenueTable[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLES) || localStorage.getItem('glasstill_tables_v1');
      return saved ? JSON.parse(saved) : INITIAL_TABLES;
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [settings, setSettings] = useState<VenueSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('glasstill_settings_v1');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [ordersHistory, setOrdersHistory] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('glasstill_orders_v1');
      return saved ? JSON.parse(saved) : SEED_HISTORICAL_ORDERS;
    } catch {
      return SEED_HISTORICAL_ORDERS;
    }
  });

  const [openOrders, setOpenOrders] = useState<Record<string, Order>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPEN_ORDERS) || localStorage.getItem('glasstill_open_orders_v1');
      return saved ? JSON.parse(saved) : INITIAL_OPEN_ORDERS;
    } catch {
      return INITIAL_OPEN_ORDERS;
    }
  });

  const [stationTickets, setStationTickets] = useState<StationTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATION_TICKETS) || localStorage.getItem('glasstill_station_tickets_v1');
      return saved ? JSON.parse(saved) : INITIAL_STATION_TICKETS;
    } catch {
      return INITIAL_STATION_TICKETS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('drinks');
  const [selectedTable, setSelectedTable] = useState<VenueTable | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSubmissionNotice, setLastSubmissionNotice] = useState<{ text: string; foodCount: number; drinkCount: number; timestamp: number } | null>(null);
  const [isStationMonitorOpen, setIsStationMonitorOpen] = useState<boolean>(false);

  // Clear submission banner notice after 5 seconds
  useEffect(() => {
    if (!lastSubmissionNotice) return;
    const timer = setTimeout(() => {
      setLastSubmissionNotice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [lastSubmissionNotice]);

  const clearSubmissionNotice = useCallback(() => {
    setLastSubmissionNotice(null);
  }, []);

  // Real-time broadcast channel for multi-tab till simulation
  const broadcast = useMemo(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        return new BroadcastChannel('lumatill_pos_channel');
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
    return null;
  }, []);

  const broadcastChange = useCallback((type: SyncMessage['type'], payload: any) => {
    if (broadcast) {
      setSyncStatus('syncing');
      broadcast.postMessage({
        type,
        payload,
        timestamp: Date.now(),
        sourceTillId: TILL_ID,
      });
      setTimeout(() => setSyncStatus('synced'), 200);
    }
  }, [broadcast]);

  // Listen for broadcast messages from other tills/windows/stations
  useEffect(() => {
    if (!broadcast) return;

    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      if (event.data?.sourceTillId === TILL_ID) return;
      const { type, payload } = event.data;
      setSyncStatus('syncing');

      if (type === 'TABLE_UPDATE') {
        setTables(payload);
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(payload));
      } else if (type === 'PRODUCT_UPDATE') {
        setProducts(payload);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(payload));
      } else if (type === 'MENU_CATEGORIES_UPDATE') {
        setCategories(payload);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(payload));
      } else if (type === 'SETTINGS_UPDATE') {
        setSettings(payload);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(payload));
      } else if (type === 'ORDER_COMPLETE') {
        setOrdersHistory(prev => [payload, ...prev]);
      } else if (type === 'STATION_TICKETS_UPDATE') {
        setStationTickets(payload);
        localStorage.setItem(STORAGE_KEYS.STATION_TICKETS, JSON.stringify(payload));
      } else if (type === 'OPEN_ORDERS_UPDATE') {
        setOpenOrders(payload);
        localStorage.setItem(STORAGE_KEYS.OPEN_ORDERS, JSON.stringify(payload));
      } else if (type === 'STATION_REPLY_NOTICE') {
        playAudioFeedback('bell');
        setLastSubmissionNotice({
          text: payload.message || 'Station update received',
          foodCount: 0,
          drinkCount: 0,
          timestamp: Date.now(),
        });
      }

      setTimeout(() => setSyncStatus('synced'), 150);
    };

    broadcast.addEventListener('message', handleMessage);
    return () => {
      broadcast.removeEventListener('message', handleMessage);
    };
  }, [broadcast, playAudioFeedback]);

  // Create empty initial order helper
  const createEmptyOrder = useCallback((table?: VenueTable | null, user?: UserProfile | null): Order => {
    return {
      id: 'ord_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
      tableId: table?.id,
      tableName: table?.tableName || 'Walk-up Till',
      openedBy: user?.id || 'anon',
      openedByName: user?.displayName || 'Till Operator',
      openedByRole: user?.role || 'emp',
      items: [],
      subtotal: 0,
      taxAmount: 0,
      tipAmount: 0,
      totalAmount: 0,
      isClosed: false,
      createdAt: new Date().toISOString(),
    };
  }, []);

  // Recalculate order totals whenever items or tax settings change
  const recalculateOrder = useCallback((order: Order, taxRate: number): Order => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount + (order.tipAmount || 0)).toFixed(2));

    return {
      ...order,
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount,
      totalAmount,
    };
  }, []);

  // Initialize active order
  const [activeOrder, setActiveOrder] = useState<Order>(() => {
    return createEmptyOrder();
  });

  // Inactivity Auto-Lock Timer
  useEffect(() => {
    // If on station display (kitchen / bar), don't auto-lock by default unless configured
    if (!currentUser || settings.autoLockSeconds <= 0 || currentUser.role === 'kitchen' || currentUser.role === 'bar') return;

    let timeoutId: number;
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setCurrentUser(null);
        setActiveTab('lock');
        playAudioFeedback('tap');
      }, settings.autoLockSeconds * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser, settings.autoLockSeconds, playAudioFeedback]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersHistory));
  }, [ordersHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPEN_ORDERS, JSON.stringify(openOrders));
  }, [openOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATION_TICKETS, JSON.stringify(stationTickets));
  }, [stationTickets]);

  // Helper to determine destination station
  const resolveDestinationStation = useCallback((category: string, productDest?: 'kitchen' | 'bar' | 'aux'): 'kitchen' | 'bar' | 'aux' => {
    if (productDest) return productDest;
    const foundCat = categories.find(c => c.id === category || c.name.toLowerCase() === category.toLowerCase());
    if (foundCat) return foundCat.destinationStation;
    if (category === 'food' || category.toLowerCase().includes('kitchen') || category.toLowerCase().includes('dish')) return 'kitchen';
    if (category === 'drinks' || category.toLowerCase().includes('bar') || category.toLowerCase().includes('beverage')) return 'bar';
    return 'aux';
  }, [categories]);

  // PIN Authentication - routes Kitchen PIN to Kitchen KDS and Bar PIN to Bar KDS
  const unlockWithPin = useCallback((pin: string): boolean => {
    const matched = profiles.find(p => p.pin === pin);
    if (matched) {
      setCurrentUser(matched);
      if (matched.role === 'kitchen') {
        setActiveTab('kitchen');
      } else if (matched.role === 'bar') {
        setActiveTab('bar');
      } else {
        setActiveTab(categories[0]?.id || 'drinks');
      }
      playAudioFeedback('success');
      return true;
    }
    playAudioFeedback('error');
    return false;
  }, [profiles, categories, playAudioFeedback]);

  const lockTill = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('lock');
    playAudioFeedback('tap');
  }, [playAudioFeedback]);

  const switchTab = useCallback((tab: TabType) => {
    if (tab === 'lock') {
      lockTill();
      return;
    }
    setActiveTab(tab);
    playAudioFeedback('tap');
  }, [lockTill, playAudioFeedback]);

  // Table selection with tab preservation
  const selectTable = useCallback((table: VenueTable | null) => {
    setSelectedTable(table);
    if (table) {
      const existing = openOrders[table.id];
      if (existing) {
        setActiveOrder(existing);
      } else {
        const newTableOrder = createEmptyOrder(table, currentUser);
        setActiveOrder(newTableOrder);
        setOpenOrders(prev => ({
          ...prev,
          [table.id]: newTableOrder,
        }));
      }
      if (activeTab === 'tables') {
        setActiveTab(categories[0]?.id || 'drinks');
      }
    } else {
      const walkup = openOrders['walkup'] || createEmptyOrder(null, currentUser);
      setActiveOrder(walkup);
    }
    playAudioFeedback('tap');
  }, [openOrders, createEmptyOrder, currentUser, activeTab, categories, playAudioFeedback]);

  // Add Item to Order with unsubmitted status
  const addItemToOrder = useCallback((product: Product, quantity = 1, customPrice?: number, note?: string) => {
    const itemPrice = customPrice !== undefined ? customPrice : product.price;
    const orderKey = selectedTable ? selectedTable.id : 'walkup';
    const dest = resolveDestinationStation(product.category, product.destinationStation);

    setActiveOrder(prev => {
      const existingIdx = prev.items.findIndex(
        i => i.productId === product.id && (i.note || '') === (note || '') && i.status === 'unsubmitted'
      );
      let newItems: OrderItem[];

      if (existingIdx > -1 && customPrice === undefined) {
        newItems = [...prev.items];
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + quantity,
        };
      } else {
        const newItem: OrderItem = {
          id: 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
          productId: product.id,
          name: product.name,
          category: product.category,
          quantity,
          priceAtTime: itemPrice,
          note,
          addedAt: new Date().toISOString(),
          status: 'unsubmitted',
          destination: dest,
        };
        newItems = [...prev.items, newItem];
      }

      if (selectedTable) {
        setTables(currentTables => {
          const updated = currentTables.map(t => {
            if (t.id === selectedTable.id && t.status === 'empty') {
              return { ...t, status: 'occupied' as const, assignedServer: currentUser?.displayName || t.assignedServer };
            }
            return t;
          });
          broadcastChange('TABLE_UPDATE', updated);
          return updated;
        });
      }

      const updatedOrder = recalculateOrder({
        ...prev,
        tableId: selectedTable?.id,
        tableName: selectedTable?.tableName || 'Walk-up Till',
        items: newItems,
        openedBy: currentUser?.id || prev.openedBy,
        openedByName: currentUser?.displayName || prev.openedByName,
        openedByRole: currentUser?.role || prev.openedByRole,
      }, settings.taxRate);

      setOpenOrders(currentOpen => {
        const nextOpen = {
          ...currentOpen,
          [orderKey]: updatedOrder,
        };
        broadcastChange('OPEN_ORDERS_UPDATE', nextOpen);
        return nextOpen;
      });

      return updatedOrder;
    });

    playAudioFeedback('add');
  }, [currentUser, selectedTable, settings.taxRate, resolveDestinationStation, recalculateOrder, broadcastChange, playAudioFeedback]);

  // Remove item
  const removeItemFromOrder = useCallback((itemId: string) => {
    const orderKey = selectedTable ? selectedTable.id : 'walkup';

    setActiveOrder(prev => {
      const newItems = prev.items.filter(i => i.id !== itemId);
      const updated = recalculateOrder({ ...prev, items: newItems }, settings.taxRate);
      
      setOpenOrders(currentOpen => {
        const nextOpen = {
          ...currentOpen,
          [orderKey]: updated,
        };
        broadcastChange('OPEN_ORDERS_UPDATE', nextOpen);
        return nextOpen;
      });

      return updated;
    });
    playAudioFeedback('tap');
  }, [selectedTable, settings.taxRate, recalculateOrder, broadcastChange, playAudioFeedback]);

  // Update item quantity
  const updateItemQuantity = useCallback((itemId: string, delta: number) => {
    const orderKey = selectedTable ? selectedTable.id : 'walkup';

    setActiveOrder(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as OrderItem[];

      const updated = recalculateOrder({ ...prev, items: newItems }, settings.taxRate);

      setOpenOrders(currentOpen => {
        const nextOpen = {
          ...currentOpen,
          [orderKey]: updated,
        };
        broadcastChange('OPEN_ORDERS_UPDATE', nextOpen);
        return nextOpen;
      });

      return updated;
    });
    playAudioFeedback('tap');
  }, [selectedTable, settings.taxRate, recalculateOrder, broadcastChange, playAudioFeedback]);

  // Update item note
  const updateItemNote = useCallback((itemId: string, note: string) => {
    const orderKey = selectedTable ? selectedTable.id : 'walkup';

    setActiveOrder(prev => {
      const newItems = prev.items.map(item => item.id === itemId ? { ...item, note } : item);
      const updated = { ...prev, items: newItems };

      setOpenOrders(currentOpen => {
        const nextOpen = {
          ...currentOpen,
          [orderKey]: updated,
        };
        broadcastChange('OPEN_ORDERS_UPDATE', nextOpen);
        return nextOpen;
      });

      return updated;
    });
  }, [selectedTable, broadcastChange]);

  // SUBMIT ORDER TO KITCHEN & BAR
  const submitActiveOrder = useCallback((): SubmitOrderResult => {
    const unsubmittedItems = activeOrder.items.filter(item => item.status === 'unsubmitted');
    
    if (unsubmittedItems.length === 0) {
      return {
        success: false,
        message: 'No new items to submit. All products on this ticket are already submitted.',
        foodCount: 0,
        drinkCount: 0,
        auxCount: 0,
        totalSubmitted: 0,
      };
    }

    const orderKey = selectedTable ? selectedTable.id : 'walkup';
    const submissionTime = new Date().toISOString();
    const serverName = currentUser?.displayName || activeOrder.openedByName || 'Server';
    const tableName = activeOrder.tableName || (selectedTable?.tableName) || 'Walk-up Till';

    // Partition items by resolved destination
    const foodItems = unsubmittedItems.filter(i => {
      const dest = i.destination || resolveDestinationStation(i.category);
      return dest === 'kitchen';
    });

    const drinkItems = unsubmittedItems.filter(i => {
      const dest = i.destination || resolveDestinationStation(i.category);
      return dest === 'bar';
    });

    const auxItems = unsubmittedItems.filter(i => {
      const dest = i.destination || resolveDestinationStation(i.category);
      return dest === 'aux';
    });

    const newTickets: StationTicket[] = [];

    // Route food items to Kitchen
    if (foodItems.length > 0) {
      newTickets.push({
        id: 'st_k_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
        orderId: activeOrder.id,
        tableId: selectedTable?.id,
        tableName,
        serverName,
        station: 'kitchen',
        items: foodItems.map(i => ({
          itemId: i.id,
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          note: i.note,
        })),
        submittedAt: submissionTime,
        status: 'pending',
      });
    }

    // Route drink items to Bar
    if (drinkItems.length > 0) {
      newTickets.push({
        id: 'st_b_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
        orderId: activeOrder.id,
        tableId: selectedTable?.id,
        tableName,
        serverName,
        station: 'bar',
        items: drinkItems.map(i => ({
          itemId: i.id,
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          note: i.note,
        })),
        submittedAt: submissionTime,
        status: 'pending',
      });
    }

    // Route aux items if any
    if (auxItems.length > 0) {
      newTickets.push({
        id: 'st_a_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
        orderId: activeOrder.id,
        tableId: selectedTable?.id,
        tableName,
        serverName,
        station: 'aux',
        items: auxItems.map(i => ({
          itemId: i.id,
          name: i.name,
          quantity: i.quantity,
          category: i.category,
          note: i.note,
        })),
        submittedAt: submissionTime,
        status: 'ready',
      });
    }

    // Update station tickets list
    if (newTickets.length > 0) {
      setStationTickets(prev => {
        const updated = [...newTickets, ...prev];
        broadcastChange('STATION_TICKETS_UPDATE', updated);
        return updated;
      });
    }

    // Mark items on the active order as 'submitted'
    const updatedItems: OrderItem[] = activeOrder.items.map(item => {
      if (item.status === 'unsubmitted') {
        return {
          ...item,
          status: 'submitted' as const,
          submittedAt: submissionTime,
        };
      }
      return item;
    });

    const updatedOrder: Order = {
      ...activeOrder,
      items: updatedItems,
      submittedAt: submissionTime,
    };

    setActiveOrder(updatedOrder);

    // Save submitted products onto the tab of the corresponding table
    setOpenOrders(prev => {
      const updated = {
        ...prev,
        [orderKey]: updatedOrder,
      };
      broadcastChange('OPEN_ORDERS_UPDATE', updated);
      return updated;
    });

    // Ensure table remains occupied
    if (selectedTable) {
      setTables(currentTables => {
        const updated = currentTables.map(t => {
          if (t.id === selectedTable.id) {
            return {
              ...t,
              status: (t.status === 'empty' ? 'occupied' : t.status) as any,
              assignedServer: t.assignedServer || currentUser?.displayName,
            };
          }
          return t;
        });
        broadcastChange('TABLE_UPDATE', updated);
        return updated;
      });
    }

    // Notice banner
    const parts: string[] = [];
    if (foodItems.length > 0) parts.push(`${foodItems.reduce((s, i) => s + i.quantity, 0)} food to Kitchen`);
    if (drinkItems.length > 0) parts.push(`${drinkItems.reduce((s, i) => s + i.quantity, 0)} drinks to Bar`);
    if (auxItems.length > 0) parts.push(`${auxItems.reduce((s, i) => s + i.quantity, 0)} aux`);
    
    const noticeText = `Dispatched: ${parts.join(', ')}`;
    setLastSubmissionNotice({
      text: noticeText,
      foodCount: foodItems.length,
      drinkCount: drinkItems.length,
      timestamp: Date.now(),
    });

    playAudioFeedback('bell');

    return {
      success: true,
      message: noticeText,
      foodCount: foodItems.length,
      drinkCount: drinkItems.length,
      auxCount: auxItems.length,
      totalSubmitted: unsubmittedItems.length,
    };
  }, [activeOrder, selectedTable, currentUser, resolveDestinationStation, broadcastChange, playAudioFeedback]);

  // Update ticket status in station (kitchen/bar)
  const updateStationTicketStatus = useCallback((ticketId: string, status: StationTicket['status']) => {
    const now = new Date().toISOString();
    setStationTickets(prev => {
      const updated = prev.map(ticket => {
        if (ticket.id === ticketId) {
          const updates: Partial<StationTicket> = { status };
          if (status === 'preparing' && !ticket.prepStartTime) updates.prepStartTime = now;
          if (status === 'ready' && !ticket.readyTime) updates.readyTime = now;
          if (status === 'completed' && !ticket.completedTime) updates.completedTime = now;
          return { ...ticket, ...updates };
        }
        return ticket;
      });
      broadcastChange('STATION_TICKETS_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  // Reply to ticket with message / ETA from kitchen or bar
  const replyToStationTicket = useCallback((ticketId: string, replyMessage: string, newStatus?: StationTicket['status']) => {
    const now = new Date().toISOString();
    let updatedTicketObj: StationTicket | undefined;

    setStationTickets(prev => {
      const updated = prev.map(ticket => {
        if (ticket.id === ticketId) {
          const status = newStatus || ticket.status;
          const updates: Partial<StationTicket> = {
            replyMessage,
            replyTimestamp: now,
            status,
          };
          if (status === 'preparing' && !ticket.prepStartTime) updates.prepStartTime = now;
          if (status === 'ready' && !ticket.readyTime) updates.readyTime = now;
          if (status === 'completed' && !ticket.completedTime) updates.completedTime = now;
          
          updatedTicketObj = { ...ticket, ...updates };
          return updatedTicketObj;
        }
        return ticket;
      });
      broadcastChange('STATION_TICKETS_UPDATE', updated);
      return updated;
    });

    if (updatedTicketObj) {
      const stationName = (updatedTicketObj as StationTicket).station === 'kitchen' ? '🍳 Kitchen' : '🍸 Bar';
      const tableName = (updatedTicketObj as StationTicket).tableName;
      broadcastChange('STATION_REPLY_NOTICE', {
        ticketId,
        message: `${stationName} (${tableName}): "${replyMessage}"`,
      });
    }

    playAudioFeedback('bell');
  }, [broadcastChange, playAudioFeedback]);

  // Clear completed tickets
  const clearCompletedStationTickets = useCallback(() => {
    setStationTickets(prev => {
      const updated = prev.filter(t => t.status !== 'completed');
      broadcastChange('STATION_TICKETS_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  // Clear Active Order / Reset ticket
  const clearActiveOrder = useCallback(() => {
    const orderKey = selectedTable ? selectedTable.id : 'walkup';
    const emptyOrder = createEmptyOrder(selectedTable, currentUser);
    setActiveOrder(emptyOrder);
    setOpenOrders(prev => {
      const nextOpen = { ...prev };
      if (selectedTable) {
        nextOpen[orderKey] = emptyOrder;
      } else {
        delete nextOpen['walkup'];
      }
      broadcastChange('OPEN_ORDERS_UPDATE', nextOpen);
      return nextOpen;
    });
    playAudioFeedback('tap');
  }, [createEmptyOrder, selectedTable, currentUser, broadcastChange, playAudioFeedback]);

  // Checkout and settle active order
  const checkoutActiveOrder = useCallback((
    paymentMethod: 'card' | 'cash' | 'split' | 'tab',
    tipAmount = 0,
    splitCount = 1
  ): Order => {
    const finalOrder: Order = {
      ...activeOrder,
      tipAmount,
      totalAmount: Number((activeOrder.subtotal + activeOrder.taxAmount + tipAmount).toFixed(2)),
      isClosed: true,
      paymentMethod,
      splitCount: paymentMethod === 'split' ? splitCount : undefined,
      closedBy: currentUser?.id,
      closedAt: new Date().toISOString(),
    };

    // Save to history
    setOrdersHistory(prev => [finalOrder, ...prev]);
    broadcastChange('ORDER_COMPLETE', finalOrder);

    // Free up table and clear open tab
    const orderKey = selectedTable ? selectedTable.id : 'walkup';
    setOpenOrders(prev => {
      const nextOpen = { ...prev };
      delete nextOpen[orderKey];
      broadcastChange('OPEN_ORDERS_UPDATE', nextOpen);
      return nextOpen;
    });

    if (selectedTable) {
      setTables(currentTables => {
        const updated = currentTables.map(t => {
          if (t.id === selectedTable.id) {
            return { ...t, status: 'empty' as const, assignedServer: undefined };
          }
          return t;
        });
        broadcastChange('TABLE_UPDATE', updated);
        return updated;
      });
      setSelectedTable(null);
    }

    // Reset order
    setActiveOrder(createEmptyOrder(null, currentUser));
    playAudioFeedback('bell');

    return finalOrder;
  }, [activeOrder, currentUser, selectedTable, broadcastChange, createEmptyOrder, playAudioFeedback]);

  // Table Management
  const updateTableLayout = useCallback((tableId: string, posX: number, posY: number) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === tableId ? { ...t, posX, posY } : t);
      broadcastChange('TABLE_UPDATE', updated);
      return updated;
    });
  }, [broadcastChange]);

  const addTable = useCallback((tableData: Omit<VenueTable, 'id' | 'status'>) => {
    const newTable: VenueTable = {
      ...tableData,
      id: 'tbl_' + Date.now().toString(36),
      status: 'empty',
    };
    setTables(prev => {
      const updated = [...prev, newTable];
      broadcastChange('TABLE_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('success');
  }, [broadcastChange, playAudioFeedback]);

  const deleteTable = useCallback((tableId: string) => {
    setTables(prev => {
      const updated = prev.filter(t => t.id !== tableId);
      broadcastChange('TABLE_UPDATE', updated);
      return updated;
    });
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
    playAudioFeedback('tap');
  }, [broadcastChange, selectedTable, playAudioFeedback]);

  const updateTableDetails = useCallback((tableId: string, updates: Partial<VenueTable>) => {
    setTables(prev => {
      const updated = prev.map(t => t.id === tableId ? { ...t, ...updates } : t);
      broadcastChange('TABLE_UPDATE', updated);
      return updated;
    });
  }, [broadcastChange]);

  // Category & Menu Management
  const addCategoryTab = useCallback((data: { name: string; destinationStation: 'kitchen' | 'bar' | 'aux'; subcategories?: string[]; icon?: string }): MenuCategoryTab => {
    const id = data.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36).substring(3, 6);
    const newCat: MenuCategoryTab = {
      id,
      name: data.name.trim(),
      icon: data.icon || (data.destinationStation === 'kitchen' ? 'utensils' : data.destinationStation === 'bar' ? 'wine' : 'tag'),
      destinationStation: data.destinationStation,
      subcategories: data.subcategories && data.subcategories.length > 0 ? data.subcategories : ['General'],
      isSystem: false,
    };

    setCategories(prev => {
      const updated = [...prev, newCat];
      broadcastChange('MENU_CATEGORIES_UPDATE', updated);
      return updated;
    });

    playAudioFeedback('success');
    return newCat;
  }, [broadcastChange, playAudioFeedback]);

  const addSubcategoryToCategory = useCallback((categoryId: string, subcategoryName: string) => {
    const trimmed = subcategoryName.trim();
    if (!trimmed) return;

    setCategories(prev => {
      const updated = prev.map(cat => {
        if (cat.id === categoryId) {
          if (cat.subcategories.includes(trimmed)) return cat;
          return {
            ...cat,
            subcategories: [...cat.subcategories, trimmed],
          };
        }
        return cat;
      });
      broadcastChange('MENU_CATEGORIES_UPDATE', updated);
      return updated;
    });

    playAudioFeedback('success');
  }, [broadcastChange, playAudioFeedback]);

  const updateCategoryTab = useCallback((categoryId: string, updates: Partial<MenuCategoryTab>) => {
    setCategories(prev => {
      const updated = prev.map(c => c.id === categoryId ? { ...c, ...updates } : c);
      broadcastChange('MENU_CATEGORIES_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  const deleteCategoryTab = useCallback((categoryId: string) => {
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      broadcastChange('MENU_CATEGORIES_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  // Product CSV Ingestion
  const uploadProductsCsv = useCallback((csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      return { success: false, addedCount: 0, errors: ['CSV file is empty or missing data rows.'] };
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const nameIdx = header.findIndex(h => h.includes('name') || h.includes('item'));
    const catIdx = header.findIndex(h => h.includes('category') || h.includes('cat') || h.includes('type'));
    const priceIdx = header.findIndex(h => h.includes('price') || h.includes('cost') || h.includes('amount'));
    const skuIdx = header.findIndex(h => h.includes('sku') || h.includes('code') || h.includes('id'));
    const subcatIdx = header.findIndex(h => h.includes('sub') || h.includes('group'));

    if (nameIdx === -1 || priceIdx === -1) {
      return {
        success: false,
        addedCount: 0,
        errors: ['CSV must have at least "Item Name" and "Price" columns. Category (drinks/food/aux) is strongly recommended.'],
      };
    }

    const errors: string[] = [];
    const newProducts: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i];
      const cols = rawLine.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) continue;

      const name = cols[nameIdx];
      const rawPrice = cols[priceIdx]?.replace(/[^0-9.]/g, '');
      const price = parseFloat(rawPrice);

      if (!name) {
        errors.push(`Row ${i + 1}: Missing product name.`);
        continue;
      }
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${i + 1} ("${name}"): Invalid price "${cols[priceIdx]}".`);
        continue;
      }

      let category: string = 'drinks';
      const rawCat = (catIdx > -1 ? cols[catIdx] : '').toLowerCase();
      if (rawCat.includes('food') || rawCat.includes('eat') || rawCat.includes('kitchen') || rawCat.includes('snack')) {
        category = 'food';
      } else if (rawCat.includes('aux') || rawCat.includes('merch') || rawCat.includes('fee') || rawCat.includes('service')) {
        category = 'aux';
      } else {
        category = 'drinks';
      }

      const subcategory = subcatIdx > -1 && cols[subcatIdx] ? cols[subcatIdx] : (category === 'drinks' ? 'Beverages' : category === 'food' ? 'Kitchen' : 'Other');
      const sku = skuIdx > -1 ? cols[skuIdx] : `SKU-${Date.now().toString(36).toUpperCase().substring(3, 7)}`;

      newProducts.push({
        id: 'prod_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        name,
        category,
        subcategory,
        price,
        active: true,
        sku,
      });
    }

    if (newProducts.length > 0) {
      setProducts(prev => {
        const updated = [...prev, ...newProducts];
        broadcastChange('PRODUCT_UPDATE', updated);
        return updated;
      });
      playAudioFeedback('success');
      return { success: true, addedCount: newProducts.length, errors };
    }

    return { success: false, addedCount: 0, errors };
  }, [broadcastChange, playAudioFeedback]);

  const addProduct = useCallback((productData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...productData,
      id: 'prod_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    };
    setProducts(prev => {
      const updated = [newProd, ...prev];
      broadcastChange('PRODUCT_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('success');
    return newProd;
  }, [broadcastChange, playAudioFeedback]);

  const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, ...updates } : p);
      broadcastChange('PRODUCT_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      broadcastChange('PRODUCT_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  const toggleProductActive = useCallback((productId: string) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, active: !p.active } : p);
      broadcastChange('PRODUCT_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('tap');
  }, [broadcastChange, playAudioFeedback]);

  // Profile & Settings
  const addOrUpdateProfile = useCallback((profile: UserProfile) => {
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === profile.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = profile;
        return updated;
      }
      return [...prev, profile];
    });
    playAudioFeedback('success');
  }, [playAudioFeedback]);

  const deleteProfile = useCallback((profileId: string) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    playAudioFeedback('tap');
  }, [playAudioFeedback]);

  const updateSettings = useCallback((newSettings: Partial<VenueSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      broadcastChange('SETTINGS_UPDATE', updated);
      return updated;
    });
    playAudioFeedback('success');
  }, [broadcastChange, playAudioFeedback]);

  return (
    <POSContext.Provider
      value={{
        currentUser,
        profiles,
        categories,
        activeTab,
        selectedTable,
        activeOrder,
        openOrders,
        stationTickets,
        tables,
        products,
        ordersHistory,
        settings,
        syncStatus,
        soundEnabled: settings.soundFeedback,
        lastSubmissionNotice,
        isStationMonitorOpen,
        setIsStationMonitorOpen,
        unlockWithPin,
        lockTill,
        switchTab,
        selectTable,
        addItemToOrder,
        removeItemFromOrder,
        updateItemQuantity,
        updateItemNote,
        submitActiveOrder,
        clearActiveOrder,
        checkoutActiveOrder,
        updateStationTicketStatus,
        replyToStationTicket,
        clearCompletedStationTickets,
        updateTableLayout,
        addTable,
        deleteTable,
        updateTableDetails,
        addCategoryTab,
        addSubcategoryToCategory,
        updateCategoryTab,
        deleteCategoryTab,
        uploadProductsCsv,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        addOrUpdateProfile,
        deleteProfile,
        updateSettings,
        playAudioFeedback,
        clearSubmissionNotice,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
