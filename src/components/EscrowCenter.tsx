import React, { useState, useRef, useEffect } from 'react';
import { EscrowTransaction, UserProfile, Listing, ChatMessage } from '../types';
import { ShieldCheck, MessageSquare, Key, AlertTriangle, CheckCircle, Radio, Clock, UserCheck, Star, Sparkles, Send, Copy, ThumbsUp } from 'lucide-react';

interface EscrowCenterProps {
  escrows: EscrowTransaction[];
  activeUser: UserProfile;
  listings: Listing[];
  onConfirmReceipt: (escrowId: string) => void;
  onSendMessage: (escrowId: string, text: string) => void;
  onSubmitReview: (escrowId: string, rating: number, comment: string) => void;
  reviews: any[];
}

export default function EscrowCenter({
  escrows,
  activeUser,
  listings,
  onConfirmReceipt,
  onSendMessage,
  onSubmitReview,
  reviews
}: EscrowCenterProps) {
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(
    escrows.length > 0 ? escrows[0].id : null
  );

  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Rating submission local states
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Filter listings associated with transactions
  const userEscrows = escrows.filter(e => e.buyerId === activeUser.id || e.sellerId === activeUser.id);
  const activeEscrow = escrows.find(e => e.id === selectedEscrowId);
  const linkedListing = activeEscrow ? listings.find(l => l.id === activeEscrow.listingId) : null;

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeEscrow?.messages?.length]);

  // Handle message send
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedEscrowId) return;
    onSendMessage(selectedEscrowId, inputText);
    setInputText('');
  };

  // Copping helpers
  const copyToClipboard = (text: string, isPass: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPass) {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEscrow || reviewComment.trim() === '') return;
    onSubmitReview(activeEscrow.id, ratingVal, reviewComment);
    setReviewSubmitted(true);
    setReviewComment('');
  };

  return (
    <div id="escrow_center_grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      
      {/* LEFT COLUMN: LIST OF ESCROW SESSIONS */}
      <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 p-4 rounded-3xl flex flex-col justify-start space-y-3">
        <h3 className="font-space font-black text-xs text-white uppercase tracking-wider pb-2 border-b border-neutral-850 flex items-center gap-1.5">
          <ShieldCheck className="text-yellow-500 animate-pulse" size={16} /> Closed/Active escrows
        </h3>

        {userEscrows.length === 0 ? (
          <div className="text-center py-12 space-y-2.5">
            <Radio className="mx-auto text-neutral-800" size={32} />
            <p className="text-xs text-neutral-400 font-mono">No Escrow Accounts Active</p>
            <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
              Please buy an eFootball listing from the marketplace using active funds to initiate an escrow transaction here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[500px] style-scrollbar pr-1">
            {userEscrows.map(item => {
              const isActive = selectedEscrowId === item.id;
              const isUserBuyer = item.buyerId === activeUser.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedEscrowId(item.id);
                    setReviewSubmitted(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 ${isActive ? 'bg-yellow-500/10 border-yellow-500 text-white' : 'bg-neutral-950/80 hover:bg-neutral-850 border-neutral-850 text-neutral-400'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-[9px] font-bold uppercase text-yellow-500">ID: {item.id}</span>
                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase ${
                      item.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                      item.status === 'funds_held' ? 'bg-amber-950 text-yellow-400 border border-yellow-900/40' :
                      item.status === 'credentials_released' ? 'bg-blue-950 text-blue-400 border border-blue-900/40' :
                      'bg-neutral-900 text-zinc-500'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="font-sans leading-tight">
                    <h4 className="text-xs font-bold truncate text-zinc-100">{item.listingTitle}</h4>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {isUserBuyer ? (
                        <span>Seller: <strong className="text-neutral-300 font-mono">{item.sellerName}</strong></span>
                      ) : (
                        <span>Buyer: <strong className="text-neutral-300 font-mono">{item.buyerName}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-neutral-800/60 pt-2 font-mono text-[10px]">
                    <span className="text-neutral-500 text-[9px]">LOCK VALUE</span>
                    <span className="text-white font-black">{item.listingPrice.toLocaleString()} DA</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: ACTIVE ESCROW WORKSPACE */}
      <div className="lg:col-span-8 flex flex-col justify-start">
        {!activeEscrow ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center space-y-4">
            <ShieldCheck className="text-neutral-800" size={56} />
            <div>
              <h3 className="font-space font-black text-white text-base uppercase">Secure Escrow Shield</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Under escrow protection, payments remain locked in the platform wallet. Access credentials are only transferred upon payment verification. Confirms receipt to release funds.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* ESCROW TRACKING BAR PIPELINE */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-4 shadow-md">
              <div className="flex justify-between items-center font-mono">
                <div>
                  <span className="text-neutral-500 text-[10px] block uppercase leading-none">ACTIVE ESCROW CONTRACT</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    {activeEscrow.listingTitle}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 text-[10px] block uppercase leading-none">TOTAL SECURED STATUS</span>
                  <span className="text-sm font-black text-yellow-500 block font-sans">
                    {activeEscrow.listingPrice.toLocaleString()} DZD
                  </span>
                </div>
              </div>

              {/* Progress Tracker Horizontal pipeline */}
              <div className="relative pt-4 pb-1">
                <div className="absolute top-7 left-3.5 right-3.5 h-[3px] bg-neutral-800 -translate-y-1/2 -z-0" />
                
                {/* Simulated dynamic filling based on status */}
                <div 
                  className="absolute top-7 left-3.5 h-[3px] bg-yellow-500 -translate-y-1/2 transition-all duration-500 -z-0"
                  style={{
                    width: activeEscrow.status === 'awaiting_payment' ? '10%' :
                           activeEscrow.status === 'funds_held' ? '40%' :
                           activeEscrow.status === 'credentials_released' ? '70%' :
                           '100%'
                  }}
                />

                <div className="flex justify-between items-start relative z-10 text-[9px] font-mono font-bold uppercase text-center">
                  
                  {/* Step 1: Holding */}
                  <div className="flex flex-col items-center max-w-[70px]">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                      activeEscrow.status !== 'awaiting_payment' ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-neutral-950 border-neutral-800 text-zinc-500'
                    }`}>
                      1
                    </div>
                    <span className="mt-1.5 leading-tight text-white block">Escrow locked</span>
                  </div>

                  {/* Step 2: Credentials Rev */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                      (activeEscrow.status === 'funds_held' || activeEscrow.status === 'credentials_released' || activeEscrow.status === 'completed') ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-neutral-950 border-neutral-800 text-zinc-500'
                    }`}>
                      2
                    </div>
                    <span className="mt-1.5 leading-tight text-white block">Secret Revealed</span>
                  </div>

                  {/* Step 3: Verification */}
                  <div className="flex flex-col items-center max-w-[85px]">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                      (activeEscrow.status === 'credentials_released' || activeEscrow.status === 'completed') ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-neutral-950 border-neutral-800 text-zinc-500'
                    }`}>
                      3
                    </div>
                    <span className="mt-1.5 leading-tight text-white block">Verification Chat</span>
                  </div>

                  {/* Step 4: Released */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                      activeEscrow.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-neutral-950' : 'bg-neutral-950 border-neutral-800 text-zinc-500'
                    }`}>
                      4
                    </div>
                    <span className="mt-1.5 leading-tight text-emerald-400 block font-bold">Payout Released</span>
                  </div>

                </div>
              </div>
            </div>

            {/* MAIN WORK DESK: SPLIT CHAT AND SECURE VAULT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CHAT INTERACTIVE PANEL CONSOLE */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col justify-between overflow-hidden h-[400px]">
                
                {/* Chat title bar */}
                <div className="bg-neutral-950 border-b border-neutral-800 p-3 flex items-center justify-between">
                  <span className="font-mono font-bold uppercase text-[9px] text-neutral-400 flex items-center gap-1">
                    <MessageSquare size={13} className="text-yellow-500 animate-pulse" /> TRANSACTION WORKSPACE
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5">
                    ● Encrypted Local Socket
                  </span>
                </div>

                {/* Chat Logs scroll container */}
                <div className="p-3.5 space-y-3.5 overflow-y-auto flex-grow style-scrollbar bg-neutral-9003" style={{ contentVisibility: 'auto' }}>
                  {activeEscrow.messages && activeEscrow.messages.length > 0 && activeEscrow.messages.map((msg) => {
                    const isSystemMsg = msg.isSystem;
                    const isSelf = msg.senderId === activeUser.id;

                    if (isSystemMsg) {
                      return (
                        <div key={msg.id} className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-2xl flex items-start gap-2.5 mx-auto max-w-[90%] text-center text-zinc-300 font-mono text-[9px]">
                          <ShieldCheck size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                          <div className="text-left leading-normal flex-grow">
                            <strong className="text-white uppercase font-bold text-[8px] block mb-0.5">SYSTEM ESCROW LEDGER:</strong>
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={msg.id}
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-normal font-sans ${isSelf ? 'bg-yellow-500 text-black font-medium rounded-tr-none ml-auto' : 'bg-neutral-950 text-neutral-300 rounded-tl-none mr-auto'}`}
                      >
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <span className={`font-mono text-[9px] opacity-80 ${isSelf ? 'text-black' : 'text-yellow-500 font-bold'}`}>
                            {msg.senderName}
                          </span>
                          <span className="font-mono text-[8px] opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat writing form */}
                <form onSubmit={handleSend} className="p-2 border-t border-neutral-800 bg-neutral-950 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type escrow notes / credentials query..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-grow bg-neutral-900 border border-neutral-800 rounded-xl px-3 text-xs text-neutral-300 focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-xl bg-yellow-500 text-neutral-950 hover:bg-yellow-555 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>

              </div>

              {/* CREDENTIAL VAULT PANEL CONTAINER */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col justify-between overflow-hidden h-[400px]">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
                    <Key className="text-yellow-500" size={16} />
                    <span className="font-space font-black text-xs text-zinc-100 uppercase">Secure Credentials Locker</span>
                  </div>

                  {/* Vault Visibility States logic */}
                  {(!activeEscrow.credentialsVisible && activeEscrow.status === 'awaiting_payment') ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl text-center space-y-3.5 h-full flex flex-col justify-center py-10">
                      <Clock size={28} className="mx-auto text-yellow-500 animate-spin-slow" />
                      <div>
                        <h4 className="font-mono font-bold text-xs text-yellow-500 uppercase">Awaiting payment holding</h4>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-normal uppercase">
                          Konami credentials are locked in our secure database. These will automatically reveal below to the buyer once checkout is completed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      
                      {/* Warning bar */}
                      <div className="bg-amber-500/10 border border-amber-505/20 p-3 rounded-2xl flex items-start gap-2.5 text-[10px] text-zinc-300 leading-normal">
                        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold text-white block uppercase">SECURE THE ACCOUNT IMMEDIATELY:</span>
                          We advise buyers to log in, replace the Konami linked email and update password. Confirm receipt below once verified!
                        </div>
                      </div>

                      {/* Display account details container */}
                      {linkedListing && (
                        <div className="space-y-2.5 font-mono text-xs">
                          
                          {/* Account display name */}
                          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                            <span className="text-[8px] text-neutral-500 block uppercase font-bold">eFootball Game Profile ID</span>
                            <span className="text-zinc-100 font-bold block mt-0.5">{linkedListing.gameId}</span>
                          </div>

                          {/* Login ID */}
                          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center justify-between">
                            <div>
                              <span className="text-[8px] text-neutral-500 block uppercase font-bold">Konami Login ID (Email)</span>
                              <span className="text-yellow-400 font-mono font-bold block mt-0.5 word-break select-all">{linkedListing.accountLoginId}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(linkedListing.accountLoginId, false)}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-850"
                            >
                              <Copy size={12} />
                            </button>
                          </div>

                          {/* Password */}
                          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 flex items-center justify-between">
                            <div>
                              <span className="text-[8px] text-neutral-500 block uppercase font-bold">Konami Login Password</span>
                              <span className="text-emerald-400 font-mono font-bold block mt-0.5 select-all">{linkedListing.accountPassword}</span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(linkedListing.accountPassword, true)}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors border border-neutral-850"
                            >
                              <Copy size={12} />
                            </button>
                          </div>

                          {copiedId && <span className="text-[9px] text-emerald-400 font-bold block uppercase mt-1">✓ Login ID Copied!</span>}
                          {copiedPass && <span className="text-[9px] text-emerald-400 font-bold block uppercase mt-1">✓ Password Copied!</span>}
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* ESCROW WORK DESK ACTIONS */}
                <div className="border-t border-neutral-800 pt-3">
                  {/* Buyer confirm receipt action */}
                  {activeUser.id === activeEscrow.buyerId && activeEscrow.status !== 'completed' && (
                    <div className="space-y-2">
                        <button
                          onClick={() => onConfirmReceipt(activeEscrow.id)}
                          className="w-full bg-emerald-500 hover:bg-emerald-555 text-neutral-950 font-space font-black py-2.5 rounded-2xl transition-all shadow text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck size={14} /> Commit & Release Funds to Seller
                        </button>
                        <p className="text-[8px] text-neutral-500 uppercase text-center font-mono">
                          Only click this after checking full Konami credentials and securing the eFootball account profiles successfully.
                        </p>
                    </div>
                  )}

                  {/* Seller confirmation view stating holding */}
                  {activeUser.id === activeEscrow.sellerId && activeEscrow.status !== 'completed' && (
                    <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-center text-zinc-400 font-mono text-[9px] uppercase leading-relaxed">
                      💰 Secure Holding is active. Buyer is currently verifying Konami keys in other channel. Payout remains fully guarded.
                    </div>
                  )}

                  {/* Completed transaction review submition state */}
                  {activeEscrow.status === 'completed' && (
                    <div className="space-y-3">
                      
                      <div className="bg-emerald-900/15 border border-emerald-900/40 p-3 rounded-2xl text-[10px] text-emerald-400 font-mono flex items-center gap-2">
                        <CheckCircle size={14} />
                        <div>
                          <strong className="block uppercase text-[10px] text-white">ESCROW SETTLED SUCCESSFULLY</strong>
                          Commission deducted (10%). Payout added to Seller profile.
                        </div>
                      </div>

                      {/* Review form */}
                      {activeUser.id === activeEscrow.buyerId && !reviewSubmitted && (
                        <form onSubmit={handleReviewSubmit} className="bg-neutral-950 p-3.5 border border-neutral-850 rounded-2xl space-y-3.5 font-mono text-xs">
                          <span className="text-[10px] text-yellow-500 uppercase font-black block flex items-center gap-1"><Sparkles size={11} /> Rate {activeEscrow.sellerName}</span>
                          
                          {/* Clickable stars selector */}
                          <div className="flex gap-1.5 justify-center py-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setRatingVal(star)}
                                className="focus:outline-none transition-transform hover:scale-120"
                              >
                                <Star
                                  size={18}
                                  className={star <= ratingVal ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-700'}
                                />
                              </button>
                            ))}
                          </div>

                          <textarea
                            placeholder="Add comment (e.g., 'Very fast seller, safe transfer, highly secure!')"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={2}
                            className="w-full bg-neutral-900 border border-neutral-850 rounded-xl p-2 font-sans focus:outline-none focus:border-yellow-500 text-white text-[11px]"
                          />

                          <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-510 text-neutral-950 font-sans font-bold py-1.5 rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Submit Review
                          </button>
                        </form>
                      )}

                      {reviewSubmitted && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-3 rounded-xl text-center text-[10px] uppercase font-bold flex items-center justify-center gap-1.5">
                          <ThumbsUp size={13} /> Review Saved! Feedback published onto registry.
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
