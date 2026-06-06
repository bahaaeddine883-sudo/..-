import { UserProfile, Listing, Review, Notification, SquadPlayer } from '../types';

export const INITIAL_USERS: Record<string, UserProfile> = {
  'buyer_dz': {
    id: 'buyer_dz',
    username: 'FaresAlgeria16',
    email: 'fares.algeria16@mail.dz',
    role: 'buyer',
    walletBalance: 12500, // 12,500 DA (DZD)
    salesCompleted: 0,
    rating: 0,
    numReviews: 0,
    joinedAt: '2026-01-15'
  },
  'seller_pro': {
    id: 'seller_pro',
    username: 'DZ_Gamer_Pro',
    email: 'gamer.pro.dz@gmail.com',
    role: 'seller',
    walletBalance: 4500, // 4,500 DA
    salesCompleted: 24,
    rating: 4.8,
    numReviews: 8,
    joinedAt: '2025-08-10'
  },
  'seller_stars': {
    id: 'seller_stars',
    username: 'PES_Master_Dz',
    email: 'pes.master.alg@outlook.com',
    role: 'seller',
    walletBalance: 0,
    salesCompleted: 5,
    rating: 4.2,
    numReviews: 3,
    joinedAt: '2025-11-20'
  }
};

const SQUAD_1: SquadPlayer[] = [
  { name: 'L. Messi', rating: 104, cardType: 'Big Time', position: 'CF' },
  { name: 'Ronaldinho', rating: 102, cardType: 'Epic', position: 'LWF' },
  { name: 'D. Maradona', rating: 103, cardType: 'Epic', position: 'AMF' },
  { name: 'K. Mbappé', rating: 99, cardType: 'Featured', position: 'RWF' },
  { name: 'P. Vieira', rating: 100, cardType: 'Legend', position: 'DMF' },
  { name: 'R. Gullit', rating: 101, cardType: 'Epic', position: 'CMF' },
  { name: 'P. Maldini', rating: 101, cardType: 'Epic', position: 'CB' },
  { name: 'V. van Dijk', rating: 97, cardType: 'Featured', position: 'CB' },
  { name: 'Theo Hernandez', rating: 96, cardType: 'Featured', position: 'LB' },
  { name: 'T. Alexander-Arnold', rating: 96, cardType: 'Featured', position: 'RB' },
  { name: 'O. Kahn', rating: 99, cardType: 'Legend', position: 'GK' }
];

const SQUAD_2: SquadPlayer[] = [
  { name: 'C. Ronaldo', rating: 101, cardType: 'Legend', position: 'CF' },
  { name: 'Neymar Jr', rating: 98, cardType: 'Big Time', position: 'LWF' },
  { name: 'E. Haaland', rating: 97, cardType: 'Featured', position: 'CF' },
  { name: 'L. Modric', rating: 96, cardType: 'Featured', position: 'CMF' },
  { name: 'Casemiro', rating: 95, cardType: 'Featured', position: 'DMF' },
  { name: 'K. De Bruyne', rating: 97, cardType: 'Featured', position: 'AMF' },
  { name: 'A. Davies', rating: 95, cardType: 'Featured', position: 'LB' },
  { name: 'R. Araujo', rating: 96, cardType: 'Featured', position: 'CB' },
  { name: 'Marquinhos', rating: 95, cardType: 'Featured', position: 'CB' },
  { name: 'A. Hakimi', rating: 95, cardType: 'Featured', position: 'RB' },
  { name: 'M. ter Stegen', rating: 96, cardType: 'Featured', position: 'GK' }
];

const SQUAD_3: SquadPlayer[] = [
  { name: 'Johan Cruyff', rating: 103, cardType: 'Epic', position: 'CF' },
  { name: 'D. Beckham', rating: 99, cardType: 'Big Time', position: 'RWF' },
  { name: 'Kaká', rating: 100, cardType: 'Epic', position: 'AMF' },
  { name: 'Andrea Pirlo', rating: 99, cardType: 'Epic', position: 'CMF' },
  { name: 'F. Rijkaard', rating: 98, cardType: 'Legend', position: 'DMF' },
  { name: 'B. Bellingham', rating: 98, cardType: 'Featured', position: 'CMF' },
  { name: 'Roberto Carlos', rating: 101, cardType: 'Epic', position: 'LB' },
  { name: 'F. Baresi', rating: 99, cardType: 'Legend', position: 'CB' },
  { name: 'Alessandro Nesta', rating: 100, cardType: 'Epic', position: 'CB' },
  { name: 'Cafu', rating: 98, cardType: 'Legend', position: 'RB' },
  { name: 'I. Casillas', rating: 99, cardType: 'Epic', position: 'GK' }
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list_01',
    sellerId: 'seller_pro',
    sellerName: 'DZ_Gamer_Pro',
    sellerRating: 4.8,
    title: 'eFootball Godly Account - 3 Epic Messis + 8 Key Legends',
    description: 'Selling my high tier account, Division 1 Peak. It features the three premium 2022/2015/2009 Lionel Messi Big Time cards, Ronaldinho Epic, and Patrick Vieira in midfield. Team strength hits 3180 easily in 4-2-4 formation. Safe Konami ID with full access email.',
    platform: 'Mobile',
    legendsCount: 14,
    epicsCount: 6,
    teamStrength: 3180,
    division: 1,
    price: 8500, // 8,500 DZD
    status: 'active',
    createdAt: '2026-06-01T14:30:00Z',
    gameId: '★ DZ_ELITE ★',
    accountLoginId: 'konami.pro.algeria@pesmailbox.com',
    accountPassword: 'KonamiSuperSecretPassword2026',
    squad: SQUAD_1
  },
  {
    id: 'list_02',
    sellerId: 'seller_pro',
    sellerName: 'DZ_Gamer_Pro',
    sellerRating: 4.8,
    title: 'Balanced Console Account - Full Epic Milan Defense & Stacked Attack',
    description: 'PlayStation Account linked to Konami ID. Includes Alessandro Nesta, Baresi, Cafu and Roberto Carlos. Fully trained and max stat allocation. Frontline has Johan Cruyff Epic and Big-Time Beckham.',
    platform: 'Console',
    legendsCount: 9,
    epicsCount: 8,
    teamStrength: 3150,
    division: 2,
    price: 13500, // 13,500 DA
    status: 'active',
    createdAt: '2026-06-03T11:20:00Z',
    gameId: 'ConstantineWarrior',
    accountLoginId: 'pes_boss_constantine@konami-id.jp',
    accountPassword: 'PasswordForNestaBaresi99',
    squad: SQUAD_3
  },
  {
    id: 'list_03',
    sellerId: 'seller_stars',
    sellerName: 'PES_Master_Dz',
    sellerRating: 4.2,
    title: 'Budget Mobile Account With High Tier ShowTime & POTW Players',
    description: 'Excellent starter account with standard legend Cristiano Ronaldo, and great Club Selection and POTW (Player of the Week) cards. Div 3 peaked, perfect for someone wanting a cheap competitive account.',
    platform: 'Mobile',
    legendsCount: 3,
    epicsCount: 1,
    teamStrength: 3040,
    division: 3,
    price: 3200, // 3,200 DA
    status: 'active',
    createdAt: '2026-06-04T18:45:00Z',
    gameId: 'MasterDzGamer99',
    accountLoginId: 'masterdzgamer@gmail.com',
    accountPassword: 'GamerMasterPassword99!!',
    squad: SQUAD_2
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    listingId: 'old_list_101',
    listingTitle: 'Pes 2024 Legend Account Mobile',
    fromId: 'buyer_dz',
    fromName: 'FaresAlgeria16',
    toSellerId: 'seller_pro',
    rating: 5,
    comment: 'Perfect transaction! The credentials worked instantly, and payment was released without issue via Baridi Mob. Highly recommend seller!',
    createdAt: '2026-05-12T10:00:00Z'
  },
  {
    id: 'rev_2',
    listingId: 'old_list_102',
    listingTitle: 'PC eFootball Epic Beckham Account',
    fromId: 'user_dummy_3',
    fromName: 'YacineOran',
    toSellerId: 'seller_pro',
    rating: 4.5,
    comment: 'The buyer dashboard made it super easy to log into the Konami portal and secure the email. Honest person.',
    createdAt: '2026-05-28T16:15:00Z'
  },
  {
    id: 'rev_3',
    listingId: 'old_list_103',
    listingTitle: 'Starter account D1 division',
    fromId: 'user_dummy_4',
    fromName: 'WahranGamer',
    toSellerId: 'seller_stars',
    rating: 4,
    comment: 'Very helpful, but the accounts secondary linked google account took a few hours to completely strip. Safe overall.',
    createdAt: '2026-05-30T09:12:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not_1',
    userId: 'buyer_dz',
    title: 'Welcome to eFootball Escrow Marketplace',
    message: 'Welcome! Explore listings and purchase safely. Payment is locked securely in escrow until you approve and release it to the seller.',
    type: 'info',
    read: false,
    createdAt: '2026-06-06T00:00:00Z'
  },
  {
    id: 'not_2',
    userId: 'seller_pro',
    title: 'Verification complete',
    message: 'Your seller profile is verified. You can list multiple eFootball accounts and accept payments directly through Chargily Pay DZ.',
    type: 'info',
    read: false,
    createdAt: '2026-06-05T22:30:00Z'
  }
];
