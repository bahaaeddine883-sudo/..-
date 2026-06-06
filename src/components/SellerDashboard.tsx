import React, { useState } from 'react';
import { Listing, UserProfile, PlatformType, SquadPlayer } from '../types';
import { PlusCircle, ShieldAlert, BadgeCent, ListOrdered, ClipboardList, BookCheck, Star, Users, Check, AlertCircle } from 'lucide-react';

interface SellerDashboardProps {
  listings: Listing[];
  activeUser: UserProfile;
  onAddListing: (listingData: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'sellerRating' | 'status' | 'createdAt' | 'squad'>) => void;
}

export default function SellerDashboard({
  listings,
  activeUser,
  onAddListing
}: SellerDashboardProps) {
  // Navigation inside seller tab
  const [sellerSubTab, setSellerSubTab] = useState<'listings' | 'create'>('listings');

  // New listing fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('Mobile');
  const [price, setPrice] = useState<number>(3500);
  const [teamStrength, setTeamStrength] = useState<number>(3100);
  const [division, setDivision] = useState<number>(2);
  const [legendsCount, setLegendsCount] = useState<number>(5);
  const [epicsCount, setEpicsCount] = useState<number>(2);
  const [gameId, setGameId] = useState('');
  const [accountLoginId, setAccountLoginId] = useState('');
  const [accountPassword, setAccountPassword] = useState('');

  const [validationError, setValidationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter listings by active user
  const sellerListings = listings.filter(l => l.sellerId === activeUser.id);

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setIsSuccess(false);

    if (!title || !description || !gameId || !accountLoginId || !accountPassword) {
      setValidationError('Please fill in all required fields to register the account credentials securely.');
      return;
    }

    if (price <= 0) {
      setValidationError('Please specify a positive price in DZD.');
      return;
    }

    onAddListing({
      title,
      description,
      platform,
      price,
      teamStrength,
      division,
      legendsCount,
      epicsCount,
      gameId,
      accountLoginId,
      accountPassword
    });

    setIsSuccess(true);
    // Reset fields
    setTitle('');
    setDescription('');
    setGameId('');
    setAccountLoginId('');
    setAccountPassword('');
    
    setTimeout(() => {
      setIsSuccess(false);
      setSellerSubTab('listings');
    }, 1500);
  };

  return (
    <div id="seller_dashboard_container" className="space-y-6">
      
      {/* Seller Header Statistics summary card */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center font-black text-xl text-yellow-500 font-mono">
            SZ
          </div>
          <div>
            <h1 className="text-lg font-space font-black text-white uppercase tracking-tight">Seller Portfolio Console</h1>
            <p className="text-xs text-neutral-400">Manage your eFootball inventories, setup Konami access keys, and review payouts.</p>
          </div>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto text-center font-mono text-xs">
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-850">
            <span className="text-neutral-500 text-[9px] block uppercase leading-none">SELLER REPUTATION</span>
            <span className="text-sm font-black text-yellow-500 leading-none block mt-1 flex items-center justify-center gap-1">
              ★ {activeUser.rating > 0 ? activeUser.rating.toFixed(1) : 'No Reviews'}
            </span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-850">
            <span className="text-neutral-500 text-[9px] block uppercase leading-none">ITEMS TRANSFERRED</span>
            <span className="text-sm font-black text-white leading-none block mt-1">
              {activeUser.salesCompleted} Sales
            </span>
          </div>
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-850 col-span-2 md:col-span-1">
            <span className="text-neutral-500 text-[9px] block uppercase leading-none">ESTIMATED EARNINGS</span>
            <span className="text-sm font-black text-emerald-400 leading-none block mt-1">
              {sellerListings.filter(l => l.status === 'sold').reduce((acc, current) => acc + current.price * 0.9, 0).toLocaleString()} DA
            </span>
          </div>
        </div>
      </div>

      {/* Local view switcher */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setSellerSubTab('listings')}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 -mb-0.5 transition-all flex items-center gap-1.5 ${sellerSubTab === 'listings' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-neutral-400 hover:text-white'}`}
        >
          <ClipboardList size={14} />
          My Listed Inventories ({sellerListings.length})
        </button>

        <button
          onClick={() => setSellerSubTab('create')}
          className={`px-5 py-3 text-xs font-mono font-bold border-b-2 -mb-0.5 transition-all flex items-center gap-1.5 ${sellerSubTab === 'create' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-neutral-400 hover:text-white'}`}
        >
          <PlusCircle size={14} />
          List New Account
        </button>
      </div>

      {/* SUB TAB: MY LISTINGS */}
      {sellerSubTab === 'listings' && (
        <div className="space-y-4">
          {sellerListings.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3">
              <ClipboardList className="mx-auto text-neutral-700" size={36} />
              <h3 className="font-space font-extrabold text-white text-sm">No Listings Found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                You haven't listed any eFootball accounts yet. Start listing now to access escrow protections.
              </p>
              <button
                onClick={() => setSellerSubTab('create')}
                className="bg-yellow-500 text-neutral-950 font-mono font-bold text-xs px-4 py-2 rounded-xl"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[9px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4">Account ID</th>
                      <th className="p-4">Platform / Division</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Price (DZD)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Escrow Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {sellerListings.map(item => (
                      <tr key={item.id} className="hover:bg-neutral-850 transition-colors">
                        <td className="p-4 font-bold text-yellow-500">{item.id}</td>
                        <td className="p-4">
                          <span className="block font-sans text-[11px] text-white font-semibold">{item.platform}</span>
                          <span className="text-[10px] text-neutral-500">Peak Division {item.division}</span>
                        </td>
                        <td className="p-4 max-w-xs truncate font-sans text-[11px]">{item.title}</td>
                        <td className="p-4 font-bold text-white">
                          {item.price.toLocaleString()} DA
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.status === 'escrow' ? 'bg-yellow-550/10 text-yellow-400 border border-yellow-550/20 animate-pulse' :
                            'bg-neutral-950 text-neutral-500 border border-neutral-850'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] font-sans text-neutral-400">
                            Net: <span className="text-emerald-400 font-bold">{(item.price * 0.9).toLocaleString()} DA</span>
                          </span>
                          <span className="block text-[8px] text-zinc-500 leading-none">After (10% fee)</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB: CREATE LISTING FORM */}
      {sellerSubTab === 'create' && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-sm font-space font-black text-white flex items-center gap-2 border-b border-neutral-800 pb-3 uppercase">
            <BookCheck className="text-yellow-500" size={18} /> Register eFootball Inventory
          </h2>

          {validationError && (
            <div className="bg-red-900/15 border border-red-900/40 p-3.5 rounded-2xl flex items-start gap-2 text-xs text-red-400 font-mono">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {isSuccess && (
            <div className="bg-emerald-900/15 border border-emerald-930 p-3.5 rounded-2xl flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <Check size={16} className="text-emerald-500" />
              <span>Listing registered successfully! Pre-generating custom squad coordinates...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">Title Description <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Stacked D1 Account, 12 Epic Cards (Ronaldinho, Beckham)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white font-sans"
              />
            </div>

            {/* Platform Type */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">Gaming Platform <span className="text-red-500">*</span></label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white"
              >
                <option value="Mobile">📱 eFootball Mobile (iOS / Android)</option>
                <option value="Console">🎮 Console (PlayStation / Xbox)</option>
                <option value="PC">💻 PC Steam</option>
              </select>
            </div>

            {/* Price (DZD) */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">Price (Algerian Dinars DA) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g., 6500"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white block pr-12 font-bold font-mono"
                />
                <span className="absolute right-4 top-3.5 font-bold font-sans text-yellow-500 text-[11px]">DZD</span>
              </div>
            </div>

            {/* Team strength */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">Squad Overall Strength (e.g. 2900 - 3250)</label>
              <input
                type="number"
                placeholder="e.g., 3150"
                value={teamStrength}
                onChange={(e) => setTeamStrength(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white"
              />
            </div>

            {/* Peak Division Row */}
            <div className="grid grid-cols-3 gap-3 col-span-1 md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-zinc-400 block font-bold uppercase text-[10px]">Peak Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(parseInt(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-zinc-100"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                    <option key={d} value={d}>Division {d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 block font-bold uppercase text-[10px]">Legends Count</label>
                <input
                  type="number"
                  value={legendsCount}
                  onChange={(e) => setLegendsCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 block font-bold uppercase text-[10px]">Epics / Big Time</label>
                <input
                  type="number"
                  value={epicsCount}
                  onChange={(e) => setEpicsCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white"
                />
              </div>
            </div>

            {/* Game Nickname and User ID */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">eFootball Account Display Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., ConstantineSlayer_99"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white font-sans"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-zinc-400 block font-bold uppercase text-[10px]">Detailed Description <span className="text-red-500">*</span></label>
              <textarea
                placeholder="Write specific listings notes (e.g. 'Epic Big-Time Leo Messi, Epic Maldini, full details verified, no risk of bans. Unlinked email.')"
                value={description}
                rows={4}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 focus:outline-none focus:border-yellow-500 text-white font-sans text-xs"
              />
            </div>

            {/* Encrypted Credentials Section */}
            <div className="bg-neutral-950 border border-yellow-500/20 p-5 rounded-2xl col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-start gap-2 text-yellow-500">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-extrabold leading-none uppercase text-[10px] text-white">Escrow Credentials Vault (Secure Verification)</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono">
                    These credentials are saved locked and will ONLY be visible to the buyer AFTER their payment is verified in escrow holding.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">KONAMI ID OR EMAIL <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    placeholder="e.g., konami_linked@email.com"
                    value={accountLoginId}
                    onChange={(e) => setAccountLoginId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">PASSWORD <span className="text-red-500">*</span></span>
                  <input
                    type="password"
                    placeholder="••••••••••••••"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-505 text-neutral-950 font-space font-black py-3 rounded-2xl transition-all shadow text-xs uppercase cursor-pointer"
          >
            Register Listing under Escrow Guard
          </button>
        </form>
      )}

    </div>
  );
}
