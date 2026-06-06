import { useState } from 'react';
import { Listing, UserProfile, SquadPlayer } from '../types';
import { Search, SlidersHorizontal, Trophy, Award, Landmark, Eye, EyeOff, ShieldAlert, Star, Compass, ArrowUpDown, ChevronDown, CheckCircle } from 'lucide-react';

interface ListingsViewProps {
  listings: Listing[];
  activeUser: UserProfile;
  onInitiatePurchase: (listing: Listing) => void;
  onNavigateToWallet: () => void;
}

export default function ListingsView({
  listings,
  activeUser,
  onInitiatePurchase,
  onNavigateToWallet
}: ListingsViewProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'Mobile' | 'PC' | 'Console'>('All');
  const [sortOption, setSortOption] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating_desc'>('newest');
  const [minStrength, setMinStrength] = useState<number>(2000);
  const [minLegends, setMinLegends] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [inspectingSquadId, setInspectingSquadId] = useState<string | null>(null);

  // Filter listings
  const filteredListings = listings.filter(item => {
    if (item.status !== 'active') return false;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = platformFilter === 'All' || item.platform === platformFilter;
    const matchesStrength = item.teamStrength >= minStrength;
    const matchesLegends = (item.legendsCount + item.epicsCount) >= minLegends;

    return matchesSearch && matchesPlatform && matchesStrength && matchesLegends;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOption === 'price_asc') {
      return a.price - b.price;
    }
    if (sortOption === 'price_desc') {
      return b.price - a.price;
    }
    if (sortOption === 'rating_desc') {
      return b.sellerRating - a.sellerRating;
    }
    return 0;
  });

  // Helper to format position on tactical pitch
  const getPositionCoords = (pos: SquadPlayer['position']): { top: string; left: string } => {
    switch (pos) {
      case 'GK': return { top: '85%', left: '50%' };
      case 'LB': return { top: '65%', left: '15%' };
      case 'CB': return { top: '68%', left: '50%' };
      case 'RB': return { top: '65%', left: '85%' };
      case 'DMF': return { top: '50%', left: '50%' };
      case 'CMF': return { top: '42%', left: '30%' };
      case 'AMF': return { top: '32%', left: '50%' };
      case 'LWF': return { top: '15%', left: '15%' };
      case 'CF': return { top: '10%', left: '50%' };
      case 'RWF': return { top: '15%', left: '85%' };
      default: return { top: '50%', left: '50%' };
    }
  };

  return (
    <div id="listings_view_wrapper" className="space-y-6">
      
      {/* Search and Filters Strip */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Main search input */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="Search eFootball accounts (e.g. 'Messi Epic', 'Constantine', 'DZ_Gamer')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-11 pr-4 text-xs text-neutral-300 focus:outline-none focus:border-yellow-500 font-mono"
            />
          </div>

          {/* Platform Quick links */}
          <div className="flex gap-1.5 overflow-x-auto select-none bg-neutral-950 p-1 rounded-2xl border border-neutral-800 shrink-0">
            {(['All', 'Mobile', 'Console', 'PC'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all ${platformFilter === p ? 'bg-yellow-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                {p === 'All' ? '🎮 All Formats' : p === 'Mobile' ? '📱 Mobile' : p === 'Console' ? '🎮 Console' : '💻 PC'}
              </button>
            ))}
          </div>

          {/* Toggle advance filters & sorting */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-mono font-bold transition-all border ${showFilters ? 'bg-yellow-500/15 border-yellow-500 text-yellow-500' : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-white'}`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Advance Filters Drawer */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-850 font-mono text-xs">
            
            {/* Min Team Strength */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block">Min Squad Strength ({minStrength})</label>
              <input
                type="range"
                min="2000"
                max="3200"
                step="50"
                value={minStrength}
                onChange={(e) => setMinStrength(parseInt(e.target.value))}
                className="w-full accent-yellow-500 cursor-ew-resize py-1"
              />
            </div>

            {/* Min Legendary Card counts */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block">Min Legends & Epics ({minLegends}+)</label>
              <div className="flex gap-1">
                {[0, 3, 6, 10, 15].map(n => (
                  <button
                    key={n}
                    onClick={() => setMinLegends(n)}
                    className={`flex-grow py-1 rounded border text-[10px] font-bold ${minLegends === n ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-neutral-950 border-neutral-800 text-neutral-400'}`}
                  >
                    {n === 0 ? 'Any' : `${n}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 block">Sort Ledger By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-850 rounded-xl p-2 focus:outline-none focus:border-yellow-500 text-xs text-white"
              >
                <option value="newest">⏰ Date: Newest Listed</option>
                <option value="price_asc">📈 Price: Low to High</option>
                <option value="price_desc">📉 Price: High to Low</option>
                <option value="rating_desc">⭐ Rep: High Star Sellers</option>
              </select>
            </div>

            {/* Information badge */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3.5 flex items-start gap-2.5 text-[10px] text-zinc-300 leading-normal">
              <Landmark size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-white block">Escrow Protected</span>
                Holdings are secured by our DZ escrow contracts. Platform commission is locked in until delivery.
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Catalog Grid */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-24 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-3 p-8">
          <Compass size={40} className="mx-auto text-neutral-700 animate-spin-slow" />
          <h3 className="font-space font-extrabold text-base text-white">No Listings Matched Your Filter</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Try resetting your range filters or looking up another character keyword, e.g., "Messi", or select alternate platforms in the tab filters.
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('All');
              setMinStrength(2000);
              setMinLegends(0);
            }} 
            className="text-xs font-mono font-bold text-yellow-500 hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedListings.map(item => {
            const isInspectingSquad = inspectingSquadId === item.id;
            
            return (
              <div 
                key={item.id}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
              >
                
                {/* Visual Header Grid with platform background and rating */}
                <div className="p-5 border-b border-neutral-850/80 space-y-3 relative">
                  
                  {/* Category ribbons */}
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-1 text-[10px] font-mono font-extrabold rounded-lg border leading-none uppercase ${item.platform === 'Mobile' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : item.platform === 'Console' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                      {item.platform === 'Mobile' ? '📱 Mobile Squad' : item.platform === 'Console' ? '🎮 Console (PS/XB)' : '💻 PC Steam'}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">Peak Rank: <span className="text-yellow-400 font-bold">Div {item.division}</span></span>
                  </div>

                  {/* Title and stats summary */}
                  <div>
                    <h2 className="text-sm font-space font-black text-white hover:text-yellow-500 transition-colors tracking-tight leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-[11px] text-neutral-500 leading-normal line-clamp-2 mt-1 whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>

                  {/* Technical values indicators grid */}
                  <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-3 rounded-2xl border border-neutral-850 font-mono text-center">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 block leading-tight">Squad Strength</span>
                      <span className="text-xs font-black text-white font-sans">{item.teamStrength}</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 block leading-tight">Epic Cards</span>
                      <span className="text-xs font-black text-yellow-500 font-sans">{item.epicsCount} Epics</span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-zinc-500 block leading-tight">Legend Counts</span>
                      <span className="text-xs font-black text-amber-500 font-sans">{item.legendsCount} Legends</span>
                    </div>
                  </div>

                  {/* Seller Profile block */}
                  <div className="flex items-center justify-between border-t border-neutral-850/60 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-850 border border-neutral-800 flex items-center justify-center font-bold text-xs text-yellow-500 font-mono uppercase">
                        {item.sellerName.substring(0, 2)}
                      </div>
                      <div>
                        <span className="text-xs text-white font-extrabold leading-none block">{item.sellerName}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-yellow-500 font-black flex items-center leading-none">
                            ★ {item.sellerRating.toFixed(1)}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">({item.sellerRating >= 4.5 ? 'VIP Seller' : 'Verified'})</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingSquadId(isInspectingSquad ? null : item.id)}
                      className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all ${isInspectingSquad ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-neutral-950 hover:bg-neutral-850 border-neutral-850 text-neutral-400'}`}
                    >
                      {isInspectingSquad ? (
                        <>
                          <EyeOff size={12} /> Hide Pitch Lineup
                        </>
                      ) : (
                        <>
                          <Eye size={12} /> Inspect Squad Lineup
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Inspecting Team Lineup Tactical Field */}
                {isInspectingSquad && (
                  <div className="bg-neutral-950 p-4 border-b border-neutral-850 animate-fadeIn overflow-hidden">
                    <div className="mb-2.5 flex justify-between items-center font-mono">
                      <span className="text-[10px] font-extrabold text-neutral-400 flex items-center gap-1">
                        <Trophy size={12} className="text-yellow-500" /> STADIUM TEAM FORMATION
                      </span>
                      <span className="text-[9px] text-zinc-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                        Formation: 4-3-3 Balanced
                      </span>
                    </div>

                    {/* Green pitch outline representation */}
                    <div className="w-full h-80 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 rounded-2xl relative border-2 border-neutral-800 shadow-inner overflow-hidden select-none">
                      
                      {/* Soccer Pitch lines overlay */}
                      <div className="absolute inset-0 border border-white/10 m-2 rounded-xl pointer-events-none" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 transform -translate-y-1/2 pointer-events-none" />
                      <div className="absolute top-1/2 left-1/2 w-28 h-28 border border-white/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                      <div className="absolute top-2 left-1/2 w-40 h-20 border-b border-x border-white/10 transform -translate-x-1/2 pointer-events-none" />
                      <div className="absolute bottom-2 left-1/2 w-40 h-20 border-t border-x border-white/10 transform -translate-x-1/2 pointer-events-none" />

                      {/* Map players */}
                      {item.squad.map((player) => {
                        const coords = getPositionCoords(player.position);
                        const isEpic = player.cardType === 'Epic';
                        const isBigTime = player.cardType === 'Big Time';
                        const isLegend = player.cardType === 'Legend';

                        return (
                          <div
                            key={player.name}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                            style={{ top: coords.top, left: coords.left }}
                          >
                            <div className={`p-1 w-11 h-11 rounded-full border flex flex-col justify-center items-center shadow-lg transition-transform hover:scale-125 cursor-help ${
                              isEpic ? 'bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 border-yellow-300 text-neutral-900' :
                              isBigTime ? 'bg-gradient-to-tr from-emerald-600 via-teal-300 to-cyan-500 border-teal-200 text-neutral-950 font-black' :
                              isLegend ? 'bg-gradient-to-tr from-neutral-800 via-amber-700 to-zinc-900 border-amber-600 text-amber-200' :
                              'bg-neutral-905 border-neutral-800 text-neutral-300'
                            }`}>
                              <span className="text-[10px] font-extrabold leading-none">{player.position}</span>
                              <span className="text-[8px] font-sans font-bold leading-none mt-0.5 truncate max-w-[40px] text-center">{player.name.replace('. ', '')}</span>
                              <span className="text-[7px] font-mono leading-none font-bold opacity-80">{player.rating}</span>
                            </div>

                            {/* Simple tooltip explanation */}
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black border border-neutral-800 text-[8px] text-white p-1 text-center rounded whitespace-nowrap outline-none font-mono">
                              {player.name} ({player.cardType})
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Listing pricing action footer */}
                <div className="p-5 bg-neutral-950/80 border-t border-neutral-850 flex items-center justify-between">
                  <div className="leading-tight">
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">GUARANTEED PRICE</span>
                    <span className="text-lg font-space font-black text-white selection:bg-yellow-500 font-mono tracking-tight flex items-end gap-1">
                      {item.price.toLocaleString()} <span className="text-xs text-yellow-500 font-bold uppercase font-space">DA (DZD)</span>
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    {/* Secure Purchase button using safe modal check */}
                    <button
                      onClick={() => onInitiatePurchase(item)}
                      className="bg-yellow-500 hover:bg-yellow-550 text-neutral-950 hover:scale-102 transition-all font-space font-black text-xs px-5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow"
                    >
                      <Award size={14} className="text-neutral-950 font-extrabold" />
                      Secure Buy via Escrow
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
