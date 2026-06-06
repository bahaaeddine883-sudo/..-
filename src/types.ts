export type UserRole = 'buyer' | 'seller' | 'developer';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  walletBalance: number; // in DZD (DA)
  salesCompleted: number;
  rating: number; // Avg star rating from 1 to 5
  numReviews: number;
  joinedAt: string;
}

export type PlatformType = 'Mobile' | 'PC' | 'Console';
export type ListingStatus = 'active' | 'escrow' | 'sold' | 'inactive';

export interface SquadPlayer {
  name: string;
  rating: number;
  cardType: 'Epic' | 'Big Time' | 'Legend' | 'Featured' | 'Base';
  position: 'CF' | 'LWF' | 'RWF' | 'AMF' | 'CMF' | 'DMF' | 'CB' | 'LB' | 'RB' | 'GK';
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  title: string;
  description: string;
  platform: PlatformType;
  legendsCount: number;
  epicsCount: number;
  teamStrength: number; // e.g., 3120, 3180
  division: number; // e.g., 1, 2, 3
  price: number; // in DZD (DA)
  status: ListingStatus;
  createdAt: string;
  gameId: string; // User game profile ID / display name
  accountLoginId: string; // Hidden credential e.g., konami_id_77@email.com
  accountPassword: string; // Hidden credential e.g., SecureP@ss123
  squad: SquadPlayer[];
}

export type EscrowStatus = 
  | 'awaiting_payment' 
  | 'funds_held' 
  | 'credentials_released' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem: boolean;
}

export interface EscrowTransaction {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: EscrowStatus;
  lockedFunds: number; // held by platform
  commissionDeducted: number; // 10%
  payoutAmount: number; // 90%
  createdAt: string;
  updatedAt: string;
  credentialsVisible: boolean; // true when buyer pays, false before
  buyerConfirmedReceipt: boolean;
  messages: ChatMessage[];
}

export type PaymentGateway = 'chargily_baridimob' | 'chargily_cib' | 'chargily_edahabia' | 'stripe' | 'wallet';

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'payout' | 'purchase' | 'earned';
  gateway: PaymentGateway;
  status: 'pending' | 'completed' | 'failed';
  txReference: string;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  listingTitle: string;
  fromId: string;
  fromName: string;
  toSellerId: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'payment' | 'escrow' | 'review';
  read: boolean;
  createdAt: string;
}

// Sandbox environment overall state
export interface MarketplaceState {
  users: Record<string, UserProfile>;
  activeUserId: string;
  listings: Listing[];
  escrows: EscrowTransaction[];
  payments: PaymentTransaction[];
  reviews: Review[];
  notifications: Notification[];
}
