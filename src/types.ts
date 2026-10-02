export type UserRole = 'admin' | 'manager' | 'emp' | 'kitchen' | 'bar';

export type DefaultProductCategory = 'drinks' | 'food' | 'aux';
export type ProductCategory = string;

export type TableStatus = 'empty' | 'occupied' | 'billed' | 'action_required';

export type OrderItemStatus = 'unsubmitted' | 'submitted';

export interface UserProfile {
  id: string;
  pin: string; // 5-digit PIN
  displayName: string;
  role: UserRole;
  avatarColor?: string;
  createdAt: string;
  isStationAccount?: boolean;
}

export interface MenuCategoryTab {
  id: string; // e.g. "drinks", "food", "aux", "desserts", "specials"
  name: string; // e.g. "Drinks", "Food", "Aux", "Desserts", "Special Tasting"
  icon?: string;
  destinationStation: 'kitchen' | 'bar' | 'aux';
  subcategories: string[];
  isSystem?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  active: boolean;
  sku?: string;
  taxRate?: number;
  destinationStation?: 'kitchen' | 'bar' | 'aux';
}

export interface VenueTable {
  id: string;
  tableName: string;
  section: string; // e.g. "Main Bar", "Dining Hall", "Patio"
  posX: number; // Percentage or grid coord
  posY: number;
  shape: 'circle' | 'rectangle' | 'booth';
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  assignedServer?: string;
  openedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  priceAtTime: number;
  note?: string;
  addedAt: string;
  status: OrderItemStatus;
  submittedAt?: string;
  destination?: 'kitchen' | 'bar' | 'aux';
}

export interface StationTicketItem {
  itemId: string;
  name: string;
  quantity: number;
  category: ProductCategory;
  note?: string;
}

export interface StationTicket {
  id: string;
  orderId: string;
  tableId?: string;
  tableName: string;
  serverName: string;
  station: 'kitchen' | 'bar' | 'aux';
  items: StationTicketItem[];
  submittedAt: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  replyMessage?: string;
  replyTimestamp?: string;
  prepStartTime?: string;
  readyTime?: string;
  completedTime?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  tableName?: string;
  openedBy: string; // UserProfile ID or Name
  openedByName: string;
  openedByRole: UserRole;
  closedBy?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  totalAmount: number;
  isClosed: boolean;
  paymentMethod?: 'card' | 'cash' | 'split' | 'tab';
  splitCount?: number;
  createdAt: string;
  closedAt?: string;
  submittedAt?: string;
}

export type TabType = 
  | 'lock'
  | 'tables'
  | 'drinks'
  | 'food'
  | 'aux'
  | 'total'
  | 'report'
  | 'settings'
  | 'kitchen'
  | 'bar'
  | string;

export interface VenueSettings {
  venueName: string;
  taxRate: number; // e.g., 0.0825 (8.25%)
  currencySymbol: string;
  receiptFooter: string;
  autoLockSeconds: number;
  theme: 'dark' | 'light' | 'adaptive';
  printerIp: string;
  cashDrawerEnabled: boolean;
  soundFeedback: boolean;
}

export interface SyncMessage {
  type: 
    | 'TABLE_UPDATE' 
    | 'ORDER_UPDATE' 
    | 'PRODUCT_UPDATE' 
    | 'SETTINGS_UPDATE' 
    | 'ORDER_COMPLETE' 
    | 'STATION_TICKETS_UPDATE' 
    | 'OPEN_ORDERS_UPDATE'
    | 'MENU_CATEGORIES_UPDATE'
    | 'STATION_REPLY_NOTICE';
  payload: any;
  timestamp: number;
  sourceTillId: string;
}
