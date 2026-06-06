import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Calendar, Award, Info, Bell, X, Check, Heart, HelpCircle, Landmark } from 'lucide-react';
import { MarketplaceState, UserProfile, Listing, EscrowTransaction, PaymentTransaction, Review, Notification, PaymentGateway, ChatMessage } from './types';
import { INITIAL_USERS, INITIAL_LISTINGS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS } from './data/mockData';

// Subcomponents
import Navigation from './components/Navigation';
import ListingsView from './components/ListingsView';
import SellerDashboard from './components/SellerDashboard';
import EscrowCenter from './components/EscrowCenter';
import WalletAndSim from './components/WalletAndSim';
import DocViewer from './components/DocViewer';

const LOCAL_STORAGE_KEY = 'efoot_escrow_marketplace_v1';

export default function App() {
  // Main states
  const [activeTab, setActiveTab] = useState<string>('browse');
  const [mState, setMState] = useState<MarketplaceState | null>(null);
  
  // Slide out drawers and modular modal panels
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [purchaseModalListing, setPurchaseModalListing] = useState<Listing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize and load persistent levels
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMState(parsed);
      } catch (e) {
        initFreshState();
      }
    } else {
      initFreshState();
    }
  }, []);

  const initFreshState = () => {
    const fresh: MarketplaceState = {
      users: INITIAL_USERS,
      activeUserId: 'buyer_dz',
      listings: INITIAL_LISTINGS,
      escrows: [],
      payments: [
        {
          id: 'tx_init_1',
          userId: 'buyer_dz',
          amount: 15000,
          type: 'deposit',
          gateway: 'chargily_baridimob',
          status: 'completed',
          txReference: 'ch_ref_init_101',
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
        }
      ],
      reviews: INITIAL_REVIEWS,
      notifications: INITIAL_NOTIFICATIONS
    };
    saveState(fresh);
  };

  const saveState = (newState: MarketplaceState) => {
    setMState(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  if (!mState) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-400 flex items-center justify-center font-mono">
        🔄 Initializing secure escrow database...
      </div>
    );
  }

  const activeUser = mState.users[mState.activeUserId];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Changing personas
  const handleUserToggle = (userId: string) => {
    const updated = { ...mState, activeUserId: userId };
    saveState(updated);
    triggerToast(`Welcome back, ${mState.users[userId].username}! Swapped view workspace.`);
  };

  // 2. Add New Account Listing
  const handleAddListing = (listingData: any) => {
    // Generate dummy starting Squad players based on legend/epic parameters
    const pregenSquad: any[] = [
      { name: 'K. Mbappe', rating: 98, cardType: 'Featured', position: 'CF' },
      { name: 'L. Salah', rating: 97, cardType: 'Featured', position: 'RWF' },
      { name: 'Bernardo Silva', rating: 96, cardType: 'Featured', position: 'CMF' },
      { name: 'Casemiro', rating: 95, cardType: 'Base', position: 'DMF' },
      { name: 'V. van Dijk', rating: 96, cardType: 'Featured', position: 'CB' },
      { name: 'R. Dias', rating: 95, cardType: 'Featured', position: 'CB' },
      { name: 'Alisson M.', rating: 97, cardType: 'Featured', position: 'GK' },
      { name: 'A. Davies', rating: 94, cardType: 'Base', position: 'LB' },
      { name: 'A. Hakimi', rating: 94, cardType: 'Base', position: 'RB' }
    ];

    // Inject Legends
    if (listingData.legendsCount > 0) {
      pregenSquad.unshift({ name: 'P. Vieira', rating: 100, cardType: 'Legend', position: 'DMF' });
      pregenSquad.unshift({ name: 'O. Kahn', rating: 99, cardType: 'Legend', position: 'GK' });
    } else {
      pregenSquad.unshift({ name: 'J. Bellingham', rating: 97, cardType: 'Featured', position: 'AMF' });
      pregenSquad.unshift({ name: 'Vinicius Jr', rating: 96, cardType: 'Featured', position: 'LWF' });
    }

    // Inject Epics
    if (listingData.epicsCount > 0) {
      pregenSquad.unshift({ name: 'D. Maradona', rating: 103, cardType: 'Epic', position: 'AMF' });
      pregenSquad.unshift({ name: 'L. Messi', rating: 104, cardType: 'Big Time', position: 'CF' });
    } else {
      pregenSquad.unshift({ name: 'E. Haaland', rating: 98, cardType: 'Featured', position: 'CF' });
      pregenSquad.unshift({ name: 'Neymar Jr', rating: 97, cardType: 'Featured', position: 'LWF' });
    }

    const newId = 'list_' + Math.random().toString(36).substring(2, 8);
    const newListing: Listing = {
      id: newId,
      sellerId: activeUser.id,
      sellerName: activeUser.username,
      sellerRating: activeUser.rating || 5.0,
      title: listingData.title,
      description: listingData.description,
      platform: listingData.platform,
      legendsCount: listingData.legendsCount,
      epicsCount: listingData.epicsCount,
      teamStrength: listingData.teamStrength,
      division: listingData.division,
      price: listingData.price,
      status: 'active',
      createdAt: new Date().toISOString(),
      gameId: listingData.gameId,
      accountLoginId: listingData.accountLoginId,
      accountPassword: listingData.accountPassword,
      squad: pregenSquad.slice(0, 11) // Keep exactly 11 starting XI
    };

    const newNot: Notification = {
      id: 'not_' + Math.random().toString(36).substring(2, 8),
      userId: activeUser.id,
      title: 'Listing Published Successfully',
      message: `Your account listing "${listingData.title}" is now active in the browse katalog database.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    };

    saveState({
      ...mState,
      listings: [newListing, ...mState.listings],
      notifications: [newNot, ...mState.notifications]
    });

    triggerToast('Added inventory under escrow protections.');
  };

  // 3. Initiate Escrow Purchase
  const handleInitiatePurchase = (listing: Listing) => {
    setPurchaseModalListing(listing);
  };

  const handleConfirmPurchase = () => {
    if (!purchaseModalListing) return;

    if (activeUser.id === purchaseModalListing.sellerId) {
      triggerToast('Error: Sellers are forbidden from purchasing their own eFootball inventories.');
      setPurchaseModalListing(null);
      return;
    }

    if (activeUser.walletBalance < purchaseModalListing.price) {
      triggerToast('Error: Insufficient balance. Please check the deposit dashboard.');
      // Route immediately to gate
      setActiveTab('wallet-sandbox');
      setPurchaseModalListing(null);
      return;
    }

    const escrowId = 'esc_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const commission = Math.round(purchaseModalListing.price * 0.10); // 10% Platform fee
    const payout = purchaseModalListing.price - commission;

    const initialMessage: ChatMessage = {
      id: 'msg_system_1',
      senderId: 'system',
      senderName: 'ESCROW BOT',
      text: `🔐 Escrow transaction initialized securely!\n- Item Value: ${purchaseModalListing.price.toLocaleString()} DZD\n- Commission held (10%): ${commission.toLocaleString()} DZD\n- Lock Contract Status: ACTIVE FUNDS SECURED.\n- System: Konami Credentials decrypted and revealed safely inside the secure panel above to Buyer ${activeUser.username}. Sellers balances will credit once buyer confirms receipt.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    };

    // Construct transaction details
    const newEscrow: EscrowTransaction = {
      id: escrowId,
      listingId: purchaseModalListing.id,
      listingTitle: purchaseModalListing.title,
      listingPrice: purchaseModalListing.price,
      buyerId: activeUser.id,
      buyerName: activeUser.username,
      sellerId: purchaseModalListing.sellerId,
      sellerName: purchaseModalListing.sellerName,
      status: 'funds_held', // Funds secured in state
      lockedFunds: purchaseModalListing.price,
      commissionDeducted: commission,
      payoutAmount: payout,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      credentialsVisible: true, // Visible to authorized buyer is pay is done
      buyerConfirmedReceipt: false,
      messages: [initialMessage]
    };

    // Deduct buyer funds
    const updatedUsers = { ...mState.users };
    updatedUsers[activeUser.id] = {
      ...activeUser,
      walletBalance: activeUser.walletBalance - purchaseModalListing.price
    };

    // Update listings to "escrow" state
    const updatedListings = mState.listings.map(l => {
      if (l.id === purchaseModalListing.id) {
        return { ...l, status: 'escrow' as const };
      }
      return l;
    });

    // Generate notifications
    const notifications: Notification[] = [
      {
        id: 'not_' + Math.random().toString(36).substring(2, 8),
        userId: activeUser.id,
        title: 'Escrow Account Locked',
        message: `Your payment for "${purchaseModalListing.title}" is holding in secure locking stage. Check the accounts panel.`,
        type: 'escrow',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'not_' + Math.random().toString(36).substring(2, 8),
        userId: purchaseModalListing.sellerId,
        title: 'Item Sold (Holding in Escrow)',
        message: `Your listing "${purchaseModalListing.title}" was sold. Payment is locked securely in escrow balance.`,
        type: 'escrow',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];

    saveState({
      ...mState,
      users: updatedUsers,
      listings: updatedListings,
      escrows: [newEscrow, ...mState.escrows],
      notifications: [...notifications, ...mState.notifications]
    });

    setPurchaseModalListing(null);
    setActiveTab('escrow');
    triggerToast('Purchase successful under escrow protective holdings!');
  };

  // 4. Confirm Receipt & Release Escrow Funds to Seller
  const handleConfirmReceipt = (escrowId: string) => {
    const escrowIndex = mState.escrows.findIndex(e => e.id === escrowId);
    if (escrowIndex === -1) return;

    const escrow = mState.escrows[escrowIndex];
    if (escrow.status !== 'funds_held') return;

    // Credit seller's wallet balance
    const updatedUsers = { ...mState.users };
    const seller = updatedUsers[escrow.sellerId];
    if (seller) {
      updatedUsers[escrow.sellerId] = {
        ...seller,
        walletBalance: seller.walletBalance + escrow.payoutAmount,
        salesCompleted: seller.salesCompleted + 1
      };
    }

    // Set listing as "sold"
    const updatedListings = mState.listings.map(l => {
      if (l.id === escrow.listingId) {
        return { ...l, status: 'sold' as const };
      }
      return l;
    });

    // Create system message
    const systemMessage: ChatMessage = {
      id: 'msg_system_' + Date.now(),
      senderId: 'system',
      senderName: 'ESCROW BOT',
      text: `🏆 TRANSACTION CLOSED & SETTLED!\n- Receipt confirmed by Buyer: ${escrow.buyerName}\n- Platform commission (10% fee) collected: ${escrow.commissionDeducted.toLocaleString()} DZD\n- Seller Payout (90%) added to ${escrow.sellerName} profile: ${escrow.payoutAmount.toLocaleString()} DZD\nThank you for trading responsibly with eFT Trade DZ! Please submit stars rating to share feedback.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    };

    // Update escrow
    const updatedEscrows = mState.escrows.map(e => {
      if (e.id === escrowId) {
        return {
          ...e,
          status: 'completed' as const,
          buyerConfirmedReceipt: true,
          messages: [...e.messages, systemMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return e;
    });

    // Notifications
    const notifications: Notification[] = [
      {
        id: 'not_' + Math.random().toString(36).substring(2, 8),
        userId: escrow.buyerId,
        title: 'Escrow Funds Disbursed',
        message: `Escrow ID ${escrowId} settled. Funds are now released to ${escrow.sellerName}.`,
        type: 'escrow',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'not_' + Math.random().toString(36).substring(2, 8),
        userId: escrow.sellerId,
        title: 'Payout Released onto balance',
        message: `Congratulations! ${escrow.payoutAmount.toLocaleString()} DZD (after 10% fee) was added to your wallet for sale ID ${escrowId}.`,
        type: 'payment',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];

    saveState({
      ...mState,
      users: updatedUsers,
      listings: updatedListings,
      escrows: updatedEscrows,
      notifications: [...notifications, ...mState.notifications]
    });

    triggerToast('Receipt confirmed. Escrow funds transferred cleanly.');
  };

  // 5. Send chat message
  const handleSendMessage = (escrowId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: activeUser.id,
      senderName: activeUser.username,
      text: text,
      timestamp: new Date().toISOString(),
      isSystem: false
    };

    const updatedEscrows = mState.escrows.map(e => {
      if (e.id === escrowId) {
        return {
          ...e,
          messages: [...e.messages, newMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return e;
    });

    saveState({
      ...mState,
      escrows: updatedEscrows
    });
  };

  // 6. Submit Stars review
  const handleSubmitReview = (escrowId: string, rating: number, comment: string) => {
    const escrow = mState.escrows.find(e => e.id === escrowId);
    if (!escrow) return;

    const newRevId = 'rev_' + Math.random().toString(36).substring(2, 8);
    const newReview: Review = {
      id: newRevId,
      listingId: escrow.listingId,
      listingTitle: escrow.listingTitle,
      fromId: activeUser.id,
      fromName: activeUser.username,
      toSellerId: escrow.sellerId,
      rating: rating,
      comment: comment,
      createdAt: new Date().toISOString()
    };

    // Calculate new seller aggregate rating
    const updatedUsers = { ...mState.users };
    const seller = updatedUsers[escrow.sellerId];
    if (seller) {
      const sellerReviews = mState.reviews.filter(r => r.toSellerId === escrow.sellerId);
      const newTotalRating = sellerReviews.reduce((acc, curr) => acc + curr.rating, 0) + rating;
      const newAvgRating = newTotalRating / (sellerReviews.length + 1);

      updatedUsers[escrow.sellerId] = {
        ...seller,
        rating: Math.round(newAvgRating * 10) / 10,
        numReviews: seller.numReviews + 1
      };
    }

    saveState({
      ...mState,
      users: updatedUsers,
      reviews: [newReview, ...mState.reviews]
    });

    triggerToast('Review submitted successfully!');
  };

  // 7. Simulated payment complete top up
  const handleDepositComplete = (amount: number, gateway: PaymentGateway, ref: string) => {
    // Top up active user wallet balance
    const updatedUsers = { ...mState.users };
    updatedUsers[activeUser.id] = {
      ...activeUser,
      walletBalance: activeUser.walletBalance + amount
    };

    // Append ledger record
    const newTx: PaymentTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 8),
      userId: activeUser.id,
      amount: amount,
      type: 'deposit',
      gateway: gateway,
      status: 'completed',
      txReference: ref,
      createdAt: new Date().toISOString()
    };

    const newNot: Notification = {
      id: 'not_' + Math.random().toString(36).substring(2, 8),
      userId: activeUser.id,
      title: 'Wallet Funds Deposited',
      message: `Successfully verified Algérie Poste invoice for ${amount.toLocaleString()} DZD via Reference: ${ref}. Wallet credited!`,
      type: 'payment',
      read: false,
      createdAt: new Date().toISOString()
    };

    saveState({
      ...mState,
      users: updatedUsers,
      payments: [newTx, ...mState.payments],
      notifications: [newNot, ...mState.notifications]
    });

    triggerToast(`Added ${amount.toLocaleString()} DA to balance successfully!`);
  };

  const handleMarkNotificationsRead = () => {
    const updatedNotifs = mState.notifications.map(n => ({ ...n, read: true }));
    saveState({ ...mState, notifications: updatedNotifs });
    triggerToast('All notifications marked as read.');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans flex flex-col justify-between selection:bg-yellow-500 selection:text-neutral-950">
      
      {/* Dynamic Toast Alert popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] bg-neutral-900 border-2 border-yellow-500 px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-mono font-bold text-white shadow-2xl"
          >
            <ShieldCheck size={16} className="text-yellow-500 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main navigation systems */}
      <Navigation
        users={mState.users}
        activeUserId={mState.activeUserId}
        onUserToggle={handleUserToggle}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={mState.notifications}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
      />

      {/* Primary desk center workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            
            {activeTab === 'browse' && (
              <ListingsView
                listings={mState.listings}
                activeUser={activeUser}
                onInitiatePurchase={handleInitiatePurchase}
                onNavigateToWallet={() => setActiveTab('wallet-sandbox')}
              />
            )}

            {activeTab === 'seller' && (
              <SellerDashboard
                listings={mState.listings}
                activeUser={activeUser}
                onAddListing={handleAddListing}
              />
            )}

            {activeTab === 'escrow' && (
              <EscrowCenter
                escrows={mState.escrows}
                activeUser={activeUser}
                listings={mState.listings}
                onConfirmReceipt={handleConfirmReceipt}
                onSendMessage={handleSendMessage}
                onSubmitReview={handleSubmitReview}
                reviews={mState.reviews}
              />
            )}

            {activeTab === 'wallet-sandbox' && (
              <WalletAndSim
                activeUser={activeUser}
                payments={mState.payments}
                onDepositComplete={handleDepositComplete}
              />
            )}

            {activeTab === 'docs' && (
              <DocViewer />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* SECURE PURCHASE CONFIRMATION MODAL POPUP */}
      {purchaseModalListing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur px-4 flex items-center justify-center animate-fadeIn select-text">
          <div className="bg-neutral-900 max-w-md w-full rounded-3xl border border-neutral-800 shadow-2xl p-6 space-y-5 font-sans">
            <div className="flex justify-between items-start">
              <h3 className="font-space font-black text-white text-sm uppercase flex items-center gap-2">
                <ShieldCheck className="text-yellow-500 animate-pulse" size={18} /> CONFIRM ESCROW LOCK
              </h3>
              <button 
                onClick={() => setPurchaseModalListing(null)}
                className="p-1 text-zinc-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-2xl text-xs space-y-2 font-mono">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-bold leading-none">ORDER DESCRIPTION</span>
              <strong className="text-white block font-sans text-xs">{purchaseModalListing.title}</strong>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                <div>
                  <span className="text-[8px] text-neutral-500 uppercase leading-none block">FORMAT platform</span>
                  <span className="text-[10px] text-white uppercase font-bold mt-1 block font-sans">{purchaseModalListing.platform}</span>
                </div>
                <div>
                  <span className="text-[8px] text-neutral-500 uppercase leading-none block">seller user</span>
                  <span className="text-[10px] text-yellow-500 uppercase font-bold mt-1 block">{purchaseModalListing.sellerName}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-neutral-950 p-4 border border-neutral-850 rounded-2xl">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none font-bold block">Secure Lock Amount</span>
                <span className="text-sm font-black text-amber-500 font-mono mt-0.5 block">{purchaseModalListing.price.toLocaleString()} DZD</span>
              </div>
              <div className="text-right font-mono text-[9px]">
                <span className="text-zinc-500 block font-bold uppercase leading-none">Your Wallet</span>
                <span className={`font-semibold block mt-0.5 font-sans ${activeUser.walletBalance >= purchaseModalListing.price ? 'text-emerald-400' : 'text-red-400'}`}>
                  {activeUser.walletBalance.toLocaleString()} DA
                </span>
              </div>
            </div>

            {/* Check Balance and state actions */}
            {activeUser.walletBalance < purchaseModalListing.price ? (
              <div className="space-y-3.5">
                <div className="bg-red-900/15 border border-red-900/40 p-3.5 rounded-2xl text-[10px] text-red-400 leading-normal font-mono flex items-start gap-2">
                  <X size={14} className="shrink-0 mt-0.5 text-red-500 font-bold" />
                  <div>
                    <strong className="text-white block uppercase text-[10px]">INSUFFICIENT FUNDS ERROR</strong>
                    You need to top up an additional <span className="text-white font-extrabold font-sans">{(purchaseModalListing.price - activeUser.walletBalance).toLocaleString()} DA</span>.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('wallet-sandbox');
                    setPurchaseModalListing(null);
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-505 text-neutral-950 font-sans font-bold py-2.5 rounded-2xl text-xs uppercase cursor-pointer text-center block"
                >
                  💳 Top up via Baridi Mob / Cards
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="bg-emerald-900/15 border border-emerald-900/40 p-3 rounded-2xl text-[10px] text-emerald-400 font-mono flex items-start gap-2 leading-relaxed">
                  <Check size={14} className="shrink-0 mt-0.5 text-emerald-500 font-bold" />
                  <div>
                    <strong className="text-white uppercase block text-[10px]">Secure funds verified block!</strong>
                    The balance is holding in the escrow vault correctly. Click compile below.
                  </div>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  className="w-full bg-yellow-500 hover:bg-yellow-505 text-neutral-950 font-space font-black py-3 rounded-2xl text-xs uppercase cursor-pointer"
                >
                  🚀 Confirm purchase & open escrow
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATION DRAWER OVERLAY SLIDE OUT */}
      {notifDrawerOpen && (
        <div className="fixed inset-0 z-[105] bg-black/75 backdrop-blur flex justify-end font-sans">
          
          {/* Backdrop exit */}
          <div className="flex-grow cursor-pointer" onClick={() => setNotifDrawerOpen(false)} />
          
          <div className="w-full max-w-sm bg-neutral-900 h-full border-l border-neutral-800 shadow-2xl flex flex-col justify-between p-6">
            
            <div className="space-y-5 flex-grow overflow-y-auto style-scrollbar">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="font-space font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="text-yellow-500 animate-pulse" size={16} /> Notification Console
                </h3>
                <button 
                  onClick={() => setNotifDrawerOpen(false)}
                  className="p-1 px-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:text-white rounded-lg transition-colors text-[10px] font-mono font-bold text-zinc-400"
                >
                  Close
                </button>
              </div>

              {mState.notifications.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-mono text-[10px] uppercase">
                  No Notifications Registered
                </div>
              ) : (
                <div className="space-y-3">
                  {mState.notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-3.5 rounded-2.5xl border text-xs leading-normal relative ${n.read ? 'bg-neutral-950/40 border-neutral-850 text-neutral-500' : 'bg-neutral-950 border-neutral-800 text-neutral-300'}`}
                    >
                      {!n.read && (
                        <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                      )}
                      <h4 className={`font-extrabold ${n.read ? 'text-neutral-400' : 'text-white'}`}>{n.title}</h4>
                      <p className="mt-1 pb-1 font-sans text-[11px] leading-tight text-neutral-400">{n.message}</p>
                      <span className="text-[8px] font-mono text-neutral-550 block pt-1 border-t border-neutral-900 mt-1 uppercase">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {mState.notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkNotificationsRead}
                className="w-full mt-4 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-yellow-500 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                Mark All as Read
              </button>
            )}

          </div>
        </div>
      )}

      {/* FOOTER & ACCREDITATION & LEGAL DISCLAIMER */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-6 mt-12 text-center text-[10px] text-zinc-500 relative select-text">
        <div className="max-w-7xl mx-auto px-4 space-y-3 font-mono">
          <p className="uppercase tracking-wider">
            ⚖ SECURE TRANSACTIONS MANAGED LOCKING LEDGER CORES ⚖
          </p>
          
          {/* Legal Disclaimer explicitly requested */}
          <div className="bg-neutral-900/40 border border-neutral-850 p-4 rounded-2xl max-w-2xl mx-auto text-left leading-relaxed text-[9px] uppercase">
            <span className="text-yellow-500 font-extrabold block mb-1">⚖ LEGAL RISK DISCLAIMER & RESPONSIBILITIES LIMITATION</span>
            This website is an independent escrow and trading marketplace facilitating client exchanges. We are not associated, affiliated, endorsed, or partnered with Konami, eFootball, or any parent company. Trading, purchasing, or selling gaming accounts may violate gaming Terms of Service, potentially leading to warnings, restrictions, or permanent account bans. The website is not responsible for account bans, losses, damages, or issues arising post-service. Users assume all risk, liability, and consequences of these activities.
          </div>

          <p className="text-[9px] text-neutral-600">
            eFootball Account Escrow Marketplace © 2026. Powered by Algérie Poste Baridi Mob and Chargily Payments.
          </p>
        </div>
      </footer>

    </div>
  );
}
