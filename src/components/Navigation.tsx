import { UserProfile, Notification } from '../types';
import { ShieldCheck, Wallet, FileCode, Bell, User, Layout, Eye, Search, PlusCircle } from 'lucide-react';

interface NavigationProps {
  users: Record<string, UserProfile>;
  activeUserId: string;
  onUserToggle: (userId: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: Notification[];
  onOpenNotifications: () => void;
}

export default function Navigation({
  users,
  activeUserId,
  onUserToggle,
  activeTab,
  onTabChange,
  notifications,
  onOpenNotifications
}: NavigationProps) {
  const activeUser = users[activeUserId];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50 shadow-lg px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and eFootball branding */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-xl shadow border border-yellow-400/20">
            <ShieldCheck className="text-neutral-950 font-black animate-pulse" size={20} />
          </div>
          <div>
            <span className="font-space font-black tracking-wider text-sm text-white uppercase flex items-center gap-1">
              eFT Trade <span className="text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1 py-0.2 rounded font-mono font-bold">DZ ESCROW</span>
            </span>
            <p className="text-[9px] font-mono text-neutral-400 leading-none">Secure eFootball (PES) Account Exchange</p>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-xl border border-neutral-800 overflow-x-auto max-w-full">
          <button
            onClick={() => onTabChange('browse')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === 'browse' ? 'bg-yellow-500 text-neutral-950 font-bold shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <Search size={14} />
            Browse Accounts
          </button>
          
          <button
            onClick={() => onTabChange('seller')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === 'seller' ? 'bg-yellow-500 text-neutral-950 font-bold shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <PlusCircle size={14} />
            Seller Hub
          </button>

          <button
            onClick={() => onTabChange('escrow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative duration-200 ${activeTab === 'escrow' ? 'bg-yellow-500 text-neutral-950 font-bold shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <ShieldCheck size={14} />
            Escrow Tracker
            {activeTab !== 'escrow' && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => onTabChange('wallet-sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === 'wallet-sandbox' ? 'bg-yellow-500 text-neutral-950 font-bold shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <Wallet size={14} />
            Chargily Pay Gateway
          </button>

          <button
            onClick={() => onTabChange('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === 'docs' ? 'bg-yellow-500 text-neutral-950 font-bold shadow' : 'text-neutral-400 hover:text-white'}`}
          >
            <FileCode size={14} />
            Laravel Technical Docs
          </button>
        </div>

        {/* User context & notifications tool suite */}
        <div className="flex items-center gap-4">
          
          {/* Persona Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Persona:</span>
            <select
              value={activeUserId}
              onChange={(e) => onUserToggle(e.target.value)}
              className="bg-transparent text-xs font-bold text-yellow-400 font-mono outline-none border-none cursor-pointer"
            >
              {Object.values(users).map(u => (
                <option key={u.id} value={u.id} className="bg-neutral-950 text-white font-mono">
                  {u.username} ({u.role === 'buyer' ? 'Buyer' : 'Seller'})
                </option>
              ))}
            </select>
          </div>

          {/* Wallet Counter */}
          {activeUser && (
            <div 
              onClick={() => onTabChange('wallet-sandbox')}
              className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-xl border border-yellow-500/20 cursor-pointer transition-colors"
              title="Click to top up or view transactions"
            >
              <Wallet size={14} className="text-yellow-400" />
              <div className="text-left font-mono">
                <span className="text-[9px] text-zinc-400 block leading-tight font-sans uppercase">Wallet Balance</span>
                <span className="text-xs font-black text-white leading-tight">
                  {activeUser.walletBalance.toLocaleString()} DZD
                </span>
              </div>
            </div>
          )}

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              id="notif_bell_btn"
              onClick={onOpenNotifications}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors relative"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 border-2 border-neutral-900 text-[9px] font-bold font-mono text-white flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
}
