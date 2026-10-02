import { UserProfile, Product, VenueTable, Order, VenueSettings, MenuCategoryTab } from './types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_admin_01',
    pin: '88888',
    displayName: 'Alex Vance',
    role: 'admin',
    avatarColor: '#52525b',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_mgr_01',
    pin: '54321',
    displayName: 'Elena Rostova',
    role: 'manager',
    avatarColor: '#3f3f46',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'user_st_kitchen',
    pin: '77777',
    displayName: 'Kitchen Display KDS',
    role: 'kitchen',
    avatarColor: '#ea580c',
    createdAt: '2026-02-01T00:00:00Z',
    isStationAccount: true,
  },
  {
    id: 'user_st_bar',
    pin: '66666',
    displayName: 'Bar Display KDS',
    role: 'bar',
    avatarColor: '#0284c7',
    createdAt: '2026-02-01T00:00:00Z',
    isStationAccount: true,
  },
  {
    id: 'user_emp_01',
    pin: '11111',
    displayName: 'Sarah Jenkins',
    role: 'emp',
    avatarColor: '#27272a',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'user_emp_02',
    pin: '22222',
    displayName: 'Marcus Thorne',
    role: 'emp',
    avatarColor: '#27272a',
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'user_emp_03',
    pin: '33333',
    displayName: 'Liam Chen',
    role: 'emp',
    avatarColor: '#27272a',
    createdAt: '2026-02-12T00:00:00Z',
  },
];

export const INITIAL_CATEGORIES: MenuCategoryTab[] = [
  {
    id: 'drinks',
    name: 'Drinks',
    icon: 'wine',
    destinationStation: 'bar',
    subcategories: ['Cocktails', 'Beer & Cider', 'Wine by Glass', 'Zero Proof'],
    isSystem: true,
  },
  {
    id: 'food',
    name: 'Food',
    icon: 'utensils',
    destinationStation: 'kitchen',
    subcategories: ['Small Plates & Raw', 'Mains & Steaks', 'Sides & Extras', 'Desserts'],
    isSystem: true,
  },
  {
    id: 'aux',
    name: 'Aux & Retail',
    icon: 'tag',
    destinationStation: 'aux',
    subcategories: ['Services', 'Merchandise'],
    isSystem: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Cocktails
  { id: 'drk_01', name: 'Smoked Old Fashioned', category: 'drinks', subcategory: 'Cocktails', price: 18.00, active: true, sku: 'CK-01' },
  { id: 'drk_02', name: 'Yuzu Paloma', category: 'drinks', subcategory: 'Cocktails', price: 16.50, active: true, sku: 'CK-02' },
  { id: 'drk_03', name: 'Espresso Martini (Single Origin)', category: 'drinks', subcategory: 'Cocktails', price: 17.00, active: true, sku: 'CK-03' },
  { id: 'drk_04', name: 'Oaxacan Mezcal Negroni', category: 'drinks', subcategory: 'Cocktails', price: 18.50, active: true, sku: 'CK-04' },
  { id: 'drk_05', name: 'Paper Plane', category: 'drinks', subcategory: 'Cocktails', price: 16.00, active: true, sku: 'CK-05' },
  { id: 'drk_06', name: 'Clarified Milk Punch', category: 'drinks', subcategory: 'Cocktails', price: 19.00, active: true, sku: 'CK-06' },

  // Beers & Ciders
  { id: 'drk_07', name: 'Hazy Mountain IPA 16oz', category: 'drinks', subcategory: 'Beer & Cider', price: 9.50, active: true, sku: 'BR-01' },
  { id: 'drk_08', name: 'Czech Pilsner (Draft)', category: 'drinks', subcategory: 'Beer & Cider', price: 8.00, active: true, sku: 'BR-02' },
  { id: 'drk_09', name: 'Japanese Rice Lager', category: 'drinks', subcategory: 'Beer & Cider', price: 8.50, active: true, sku: 'BR-03' },
  { id: 'drk_10', name: 'Dry Orchard Apple Cider', category: 'drinks', subcategory: 'Beer & Cider', price: 9.00, active: true, sku: 'BR-04' },
  { id: 'drk_11', name: 'Oatmeal Stout Nitro', category: 'drinks', subcategory: 'Beer & Cider', price: 10.00, active: true, sku: 'BR-05' },

  // Natural & Fine Wines
  { id: 'drk_12', name: 'Skin-Contact Orange (Glass)', category: 'drinks', subcategory: 'Wine', price: 15.00, active: true, sku: 'WN-01' },
  { id: 'drk_13', name: 'Sancerre Sauvignon Blanc', category: 'drinks', subcategory: 'Wine', price: 17.00, active: true, sku: 'WN-02' },
  { id: 'drk_14', name: 'Oregon Willamette Pinot Noir', category: 'drinks', subcategory: 'Wine', price: 16.50, active: true, sku: 'WN-03' },
  { id: 'drk_15', name: 'Pet-Nat Sparkling Rosé', category: 'drinks', subcategory: 'Wine', price: 15.50, active: true, sku: 'WN-04' },
  { id: 'drk_16', name: 'Barolo DOCG (Bottle)', category: 'drinks', subcategory: 'Wine', price: 98.00, active: true, sku: 'WN-05' },
  { id: 'drk_17', name: 'Chablis Premier Cru (Bottle)', category: 'drinks', subcategory: 'Wine', price: 110.00, active: true, sku: 'WN-06' },

  // Non-Alcoholic & Zero Proof
  { id: 'drk_18', name: 'Matcha Tonic & Bergamot', category: 'drinks', subcategory: 'Zero Proof', price: 11.00, active: true, sku: 'NA-01' },
  { id: 'drk_19', name: 'Botanical Citrus Spritz (0.0%)', category: 'drinks', subcategory: 'Zero Proof', price: 12.00, active: true, sku: 'NA-02' },
  { id: 'drk_20', name: 'Cold Brew Geisha', category: 'drinks', subcategory: 'Coffee & Tea', price: 6.50, active: true, sku: 'NA-03' },
  { id: 'drk_21', name: 'Artisan Sparkling Water (750ml)', category: 'drinks', subcategory: 'Zero Proof', price: 7.00, active: true, sku: 'NA-04' },

  // Food - Small Plates & Starters
  { id: 'fd_01', name: 'Hand-Cut Truffle Fries & Aioli', category: 'food', subcategory: 'Starters', price: 14.00, active: true, sku: 'FD-01' },
  { id: 'fd_02', name: 'Hamachi Crudo, Ponzu, Finger Lime', category: 'food', subcategory: 'Starters', price: 21.00, active: true, sku: 'FD-02' },
  { id: 'fd_03', name: 'Burrata di Puglia & Grilled Figs', category: 'food', subcategory: 'Starters', price: 19.50, active: true, sku: 'FD-03' },
  { id: 'fd_04', name: 'Blistered Shishito Peppers', category: 'food', subcategory: 'Starters', price: 13.00, active: true, sku: 'FD-04' },
  { id: 'fd_05', name: 'Crispy Calamari, Calabrian Dip', category: 'food', subcategory: 'Starters', price: 18.00, active: true, sku: 'FD-05' },

  // Food - Mains
  { id: 'fd_06', name: 'Wagyu Smash Burger & Brioche', category: 'food', subcategory: 'Mains', price: 24.00, active: true, sku: 'FD-06' },
  { id: 'fd_07', name: 'Miso-Glazed Black Cod', category: 'food', subcategory: 'Mains', price: 38.00, active: true, sku: 'FD-07' },
  { id: 'fd_08', name: 'Handmade Cacio e Pepe', category: 'food', subcategory: 'Mains', price: 26.00, active: true, sku: 'FD-08' },
  { id: 'fd_09', name: 'Prime 12oz Dry-Aged Ribeye', category: 'food', subcategory: 'Mains', price: 54.00, active: true, sku: 'FD-09' },
  { id: 'fd_10', name: 'Crispy Skin Skuna Bay Salmon', category: 'food', subcategory: 'Mains', price: 32.00, active: true, sku: 'FD-10' },
  { id: 'fd_11', name: 'Wild Chanterelle Risotto', category: 'food', subcategory: 'Mains', price: 28.00, active: true, sku: 'FD-11' },

  // Food - Desserts
  { id: 'fd_12', name: 'Burnt Basque Cheesecake', category: 'food', subcategory: 'Desserts', price: 14.00, active: true, sku: 'FD-12' },
  { id: 'fd_13', name: '70% Valrhona Dark Chocolate Ganache', category: 'food', subcategory: 'Desserts', price: 15.00, active: true, sku: 'FD-13' },
  { id: 'fd_14', name: 'Pistachio Gelato & Sea Salt', category: 'food', subcategory: 'Desserts', price: 11.00, active: true, sku: 'FD-14' },

  // Aux - Services, Merch & Custom
  { id: 'aux_01', name: 'Corkage Fee (Per Bottle)', category: 'aux', subcategory: 'Services', price: 35.00, active: true, sku: 'AUX-01' },
  { id: 'aux_02', name: 'Cake Cutting / Plating Fee', category: 'aux', subcategory: 'Services', price: 20.00, active: true, sku: 'AUX-02' },
  { id: 'aux_03', name: 'House Single-Origin Coffee (250g Bag)', category: 'aux', subcategory: 'Merchandise', price: 22.00, active: true, sku: 'AUX-03' },
  { id: 'aux_04', name: 'LumaTill Heavyweight Cotton Tee', category: 'aux', subcategory: 'Merchandise', price: 38.00, active: true, sku: 'AUX-04' },
  { id: 'aux_05', name: 'Artisanal Cocktail Bitters Trio', category: 'aux', subcategory: 'Merchandise', price: 28.00, active: true, sku: 'AUX-05' },
];

export const INITIAL_TABLES: VenueTable[] = [
  // Bar Section
  { id: 'tbl_b1', tableName: 'Bar 01', section: 'Main Bar', posX: 14, posY: 18, shape: 'circle', seats: 2, status: 'occupied', assignedServer: 'Sarah Jenkins' },
  { id: 'tbl_b2', tableName: 'Bar 02', section: 'Main Bar', posX: 14, posY: 36, shape: 'circle', seats: 2, status: 'empty' },
  { id: 'tbl_b3', tableName: 'Bar 03', section: 'Main Bar', posX: 14, posY: 54, shape: 'circle', seats: 2, status: 'billed', assignedServer: 'Marcus Thorne' },
  { id: 'tbl_b4', tableName: 'Bar 04', section: 'Main Bar', posX: 14, posY: 72, shape: 'circle', seats: 2, status: 'empty' },

  // Dining Hall
  { id: 'tbl_d1', tableName: 'Table 10', section: 'Dining Hall', posX: 40, posY: 20, shape: 'rectangle', seats: 4, status: 'occupied', assignedServer: 'Sarah Jenkins' },
  { id: 'tbl_d2', tableName: 'Table 11', section: 'Dining Hall', posX: 62, posY: 20, shape: 'rectangle', seats: 4, status: 'action_required', assignedServer: 'Liam Chen' },
  { id: 'tbl_d3', tableName: 'Table 12', section: 'Dining Hall', posX: 40, posY: 46, shape: 'rectangle', seats: 4, status: 'empty' },
  { id: 'tbl_d4', tableName: 'Table 14', section: 'Dining Hall', posX: 62, posY: 46, shape: 'rectangle', seats: 6, status: 'occupied', assignedServer: 'Marcus Thorne' },
  { id: 'tbl_d5', tableName: 'Table 15', section: 'Dining Hall', posX: 40, posY: 74, shape: 'rectangle', seats: 4, status: 'empty' },
  { id: 'tbl_d6', tableName: 'Table 16', section: 'Dining Hall', posX: 62, posY: 74, shape: 'rectangle', seats: 4, status: 'empty' },

  // Booths & Lounge
  { id: 'tbl_l1', tableName: 'Booth A', section: 'Lounge', posX: 86, posY: 22, shape: 'booth', seats: 6, status: 'occupied', assignedServer: 'Elena Rostova' },
  { id: 'tbl_l2', tableName: 'Booth B', section: 'Lounge', posX: 86, posY: 50, shape: 'booth', seats: 6, status: 'empty' },
  { id: 'tbl_l3', tableName: 'Booth C', section: 'Lounge', posX: 86, posY: 78, shape: 'booth', seats: 8, status: 'billed', assignedServer: 'Sarah Jenkins' },
];

export const INITIAL_SETTINGS: VenueSettings = {
  venueName: 'The Luminary Lounge',
  taxRate: 0.08875, // 8.875%
  currencySymbol: '$',
  receiptFooter: 'Thank you for dining with us. All spirits ethically sourced.',
  autoLockSeconds: 45,
  theme: 'dark',
  printerIp: '192.168.1.184:9100',
  cashDrawerEnabled: true,
  soundFeedback: true,
};

export const SEED_HISTORICAL_ORDERS: Order[] = [
  {
    id: 'ord_hist_01',
    tableName: 'Bar 01',
    openedBy: 'user_emp_01',
    openedByName: 'Sarah Jenkins',
    openedByRole: 'emp',
    items: [
      { id: 'it_1', productId: 'drk_01', name: 'Smoked Old Fashioned', category: 'drinks', quantity: 2, priceAtTime: 18.00, addedAt: '2026-08-22T11:30:00Z', status: 'submitted', submittedAt: '2026-08-22T11:30:00Z' },
      { id: 'it_2', productId: 'fd_01', name: 'Hand-Cut Truffle Fries & Aioli', category: 'food', quantity: 1, priceAtTime: 14.00, addedAt: '2026-08-22T11:35:00Z', status: 'submitted', submittedAt: '2026-08-22T11:35:00Z' },
    ],
    subtotal: 50.00,
    taxAmount: 4.44,
    tipAmount: 10.00,
    totalAmount: 64.44,
    isClosed: true,
    paymentMethod: 'card',
    createdAt: '2026-08-22T11:30:00Z',
    closedAt: '2026-08-22T12:15:00Z',
  },
  {
    id: 'ord_hist_02',
    tableName: 'Table 14',
    openedBy: 'user_emp_02',
    openedByName: 'Marcus Thorne',
    openedByRole: 'emp',
    items: [
      { id: 'it_3', productId: 'drk_14', name: 'Oregon Willamette Pinot Noir', category: 'drinks', quantity: 4, priceAtTime: 16.50, addedAt: '2026-08-22T12:00:00Z', status: 'submitted', submittedAt: '2026-08-22T12:00:00Z' },
      { id: 'it_4', productId: 'fd_09', name: 'Prime 12oz Dry-Aged Ribeye', category: 'food', quantity: 2, priceAtTime: 54.00, addedAt: '2026-08-22T12:10:00Z', status: 'submitted', submittedAt: '2026-08-22T12:10:00Z' },
      { id: 'it_5', productId: 'fd_07', name: 'Miso-Glazed Black Cod', category: 'food', quantity: 2, priceAtTime: 38.00, addedAt: '2026-08-22T12:10:00Z', status: 'submitted', submittedAt: '2026-08-22T12:10:00Z' },
    ],
    subtotal: 250.00,
    taxAmount: 22.19,
    tipAmount: 50.00,
    totalAmount: 322.19,
    isClosed: true,
    paymentMethod: 'card',
    createdAt: '2026-08-22T12:00:00Z',
    closedAt: '2026-08-22T13:10:00Z',
  },
  {
    id: 'ord_hist_03',
    tableName: 'Booth A',
    openedBy: 'user_mgr_01',
    openedByName: 'Elena Rostova',
    openedByRole: 'manager',
    items: [
      { id: 'it_6', productId: 'drk_02', name: 'Yuzu Paloma', category: 'drinks', quantity: 3, priceAtTime: 16.50, addedAt: '2026-08-22T12:20:00Z', status: 'submitted', submittedAt: '2026-08-22T12:20:00Z' },
      { id: 'it_7', productId: 'fd_02', name: 'Hamachi Crudo, Ponzu, Finger Lime', category: 'food', quantity: 2, priceAtTime: 21.00, addedAt: '2026-08-22T12:25:00Z', status: 'submitted', submittedAt: '2026-08-22T12:25:00Z' },
      { id: 'it_8', productId: 'fd_06', name: 'Wagyu Smash Burger & Brioche', category: 'food', quantity: 3, priceAtTime: 24.00, addedAt: '2026-08-22T12:30:00Z', status: 'submitted', submittedAt: '2026-08-22T12:30:00Z' },
    ],
    subtotal: 163.50,
    taxAmount: 14.51,
    tipAmount: 35.00,
    totalAmount: 213.01,
    isClosed: true,
    paymentMethod: 'split',
    splitCount: 3,
    createdAt: '2026-08-22T12:20:00Z',
    closedAt: '2026-08-22T13:20:00Z',
  },
  {
    id: 'ord_hist_04',
    tableName: 'Bar 04',
    openedBy: 'user_emp_03',
    openedByName: 'Liam Chen',
    openedByRole: 'emp',
    items: [
      { id: 'it_9', productId: 'drk_07', name: 'Hazy Mountain IPA 16oz', category: 'drinks', quantity: 2, priceAtTime: 9.50, addedAt: '2026-08-22T13:00:00Z', status: 'submitted', submittedAt: '2026-08-22T13:00:00Z' },
      { id: 'it_10', productId: 'aux_04', name: 'LumaTill Heavyweight Cotton Tee', category: 'aux', quantity: 1, priceAtTime: 38.00, addedAt: '2026-08-22T13:05:00Z', status: 'submitted', submittedAt: '2026-08-22T13:05:00Z' },
    ],
    subtotal: 57.00,
    taxAmount: 5.06,
    tipAmount: 10.00,
    totalAmount: 72.06,
    isClosed: true,
    paymentMethod: 'cash',
    createdAt: '2026-08-22T13:00:00Z',
    closedAt: '2026-08-22T13:18:00Z',
  }
];
