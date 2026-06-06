import React, { useState } from 'react';
import { UserProfile, PaymentTransaction, PaymentGateway } from '../types';
import { Wallet, ShieldCheck, CheckCircle, Radio, Sparkles, Send, Database, HelpCircle, Code, Award, Landmark, RefreshCw } from 'lucide-react';

interface WalletAndSimProps {
  activeUser: UserProfile;
  payments: PaymentTransaction[];
  onDepositComplete: (amount: number, gateway: PaymentGateway, ref: string) => void;
}

export default function WalletAndSim({
  activeUser,
  payments,
  onDepositComplete
}: WalletAndSimProps) {
  // Input states
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('chargily_baridimob');
  
  // Interactive Gateway checkout simulator modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [phoneRIP, setPhoneRIP] = useState('007999990022345678');
  const [phoneCIB, setPhoneCIB] = useState('1234 5678 9012 3456');
  const [buyerName, setBuyerName] = useState(activeUser.username);
  const [optSMSCode, setOptSMSCode] = useState('DZ-2026');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Live Payload Debugger panel state
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // Filter local payments
  const userPayments = payments.filter(p => p.userId === activeUser.id);

  // Trigger simulated redirect to checkout
  const handleInitiateDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 100) {
      alert('Minimum deposit amount is 100 DZD.');
      return;
    }
    setCheckoutModalOpen(true);
    setIsProcessing(false);
    setIsPaymentConfirmed(false);
  };

  // Complete Simulated payment
  const handleConfirmMockupPayment = () => {
    setIsProcessing(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentConfirmed(true);
      
      const mockRef = 'ch_ref_' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Fire parents webhook callback and wallet top up
      onDepositComplete(depositAmount, selectedGateway, mockRef);

      // Generate simulated chargily webhook payload
      const chargilyWebhookPayload = {
        event: 'checkout.paid',
        data: {
          id: 'checkout_' + Math.random().toString(36).substring(2, 15),
          price: depositAmount,
          currency: 'dzd',
          amount_to_pay: depositAmount,
          status: 'paid',
          payment_method: selectedGateway === 'chargily_baridimob font-semibold' ? 'baridimob' : selectedGateway === 'chargily_edahabia' ? 'edahabia' : 'cib',
          metadata: {
            user_id: activeUser.id,
            deposit_ref: mockRef
          },
          customer: {
            name: buyerName,
            email: activeUser.email
          },
          invoice_url: `https://mock.chargily.com/invoice/${mockRef}`,
          paid_at: new Date().toISOString()
        },
        signature: 'sha256_mock_hmac_hash_representation_66f44605938db447'
      };

      // Push webhook event logs
      setWebhookLogs(prev => [ 
        {
          timestamp: new Date().toLocaleTimeString(),
          gateway: selectedGateway,
          payload: chargilyWebhookPayload,
          action: 'Webhook Received and validated successfully!'
        },
        ...prev
      ]);

      // Automatically close modal after success flash
      setTimeout(() => {
        setCheckoutModalOpen(false);
      }, 2500);

    }, 1800);
  };

  return (
    <div id="wallet_payment_gateway" className="space-y-6">
      
      {/* Wallet metrics card and action console */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Metric dashboard panel */}
        <div className="md:col-span-5 bg-neutral-900 border border-neutral-850 p-6 rounded-3xl flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg inline-block leading-none">
              Verified Wallet
            </span>
            <h2 className="text-sm font-space font-black text-white uppercase">Your Platform Account Wallet</h2>
            <p className="text-xs text-neutral-400">Add secure funds using Algerian electronic payment portals or manage your historic cash transactions.</p>
          </div>

          <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center border border-yellow-500/20">
                <Wallet size={18} />
              </div>
              <div className="font-mono text-xs">
                <span className="text-neutral-500 text-[10px] leading-tight block">CURRENT WALLET BALANCE</span>
                <span className="text-base font-black text-zinc-100 block">
                  {activeUser.walletBalance.toLocaleString()} DZD
                </span>
                <span className="text-[9px] text-zinc-500">DZ Dinars (DA)</span>
              </div>
            </div>
            
            <div className="text-right font-mono text-[10px] text-emerald-400 font-extrabold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              ✓ Active SECURE
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 border border-dashed border-neutral-800 rounded-2xl text-[10px] text-zinc-400 leading-normal flex items-start gap-2">
            <Landmark size={15} className="mt-0.5 text-zinc-500 shrink-0" />
            <div>
              <span className="text-white font-extrabold block mb-0.5">DZ Banking Gateways Supported</span>
              Our platform triggers official Chargily pay integrations handling card networks, CIB, and Baridi Mob directly.
            </div>
          </div>
        </div>

        {/* Deposit action wallet top up form */}
        <div className="md:col-span-7 bg-neutral-900 border border-neutral-850 p-6 rounded-3xl">
          <form onSubmit={handleInitiateDeposit} className="space-y-4">
            <h3 className="font-space font-black text-xs text-white uppercase tracking-wider border-b border-neutral-850 pb-2 flex items-center gap-1.5ClassName">
              💳 Top Up Wallet Funds
            </h3>

            {/* Deposit amount input */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-neutral-400 block font-bold uppercase text-[10px]">Deposit Amount in DZD (Min 100 DA)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g., 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 pr-12 focus:outline-none focus:border-yellow-500 text-white font-extrabold text-sm"
                  required
                />
                <span className="absolute right-4 top-4 font-bold text-yellow-500 font-sans text-xs">DZD</span>
              </div>
            </div>

            {/* Gateway selection accordion */}
            <div className="space-y-2 text-xs font-mono">
              <label className="text-neutral-400 block font-bold uppercase text-[10px]">Select Payment Gateway / Method</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Baridi Mob DZ option */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('chargily_baridimob')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${selectedGateway === 'chargily_baridimob' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-900'}`}
                >
                  <div className={`p-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${selectedGateway === 'chargily_baridimob' ? 'bg-yellow-500 text-neutral-950 border-yellow-500' : 'bg-neutral-900 border-neutral-800 text-zinc-400'}`}>
                    DZ
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-white block leading-tight">Baridi Mob</span>
                    <span className="text-[9px] text-neutral-500 mt-0.5 block">Algerian RIP Transfers</span>
                  </div>
                </button>

                {/* Edahabia Card */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('chargily_edahabia')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${selectedGateway === 'chargily_edahabia' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-neutral-950 border-neutral-855 hover:bg-neutral-900'}`}
                >
                  <div className={`p-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${selectedGateway === 'chargily_edahabia' ? 'bg-yellow-500 text-neutral-950 border-yellow-500' : 'bg-neutral-900 border-neutral-800 text-zinc-400'}`}>
                    ED
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-white block leading-tight">Algérie Poste</span>
                    <span className="text-[9px] text-neutral-500 mt-0.5 block">Edahabia Gold Card</span>
                  </div>
                </button>

                {/* CIB Card */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('chargily_cib')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${selectedGateway === 'chargily_cib' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-900'}`}
                >
                  <div className={`p-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${selectedGateway === 'chargily_cib' ? 'bg-yellow-500 text-neutral-950 border-yellow-500' : 'bg-neutral-900 border-neutral-800 text-zinc-400'}`}>
                    CB
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-white block leading-tight">CIB Interbank Card</span>
                    <span className="text-[9px] text-neutral-500 mt-0.5 block">Algerian ATM Networks</span>
                  </div>
                </button>

                {/* Stripe Card */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${selectedGateway === 'stripe' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-neutral-950 border-neutral-850 hover:bg-neutral-900'}`}
                >
                  <div className={`p-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${selectedGateway === 'stripe' ? 'bg-yellow-500 text-neutral-950 border-yellow-500' : 'bg-neutral-900 border-neutral-800 text-zinc-400'}`}>
                    ST
                  </div>
                  <div>
                    <span className="text-xs font-bold font-sans text-white block leading-tight">Stripe Gateway</span>
                    <span className="text-[9px] text-neutral-500 mt-0.5 block">International Cards / USD</span>
                  </div>
                </button>

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-510 text-neutral-950 font-space font-black py-3 rounded-2xl transition-all shadow text-xs uppercase cursor-pointer"
            >
              Simulate Chargily Gateway Redirect
            </button>
          </form>
        </div>

      </div>

      {/* WEBHOOK LIVE LOGS INSPECTOR DESK */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 overflow-hidden">
        <h3 className="font-space font-black text-xs text-white uppercase tracking-wider pb-2 border-b border-neutral-850 flex items-center gap-2">
          <Database className="text-yellow-500 animate-pulse font-bold" size={16} /> LIVE WEBHOOK payload INSPECTOR
        </h3>
        <p className="text-[10px] font-mono text-zinc-400 uppercase mt-2">
          This logs sandbox signals dispatched from the Chargily APIs to our backend server. Inspect signature keys, payloads, and state callbacks logs.
        </p>

        {webhookLogs.length === 0 ? (
          <div className="bg-neutral-950 p-6 border border-neutral-850 rounded-2xl text-center mt-4 text-xs font-mono text-neutral-500 space-y-1">
            <Radio className="mx-auto text-neutral-800 animate-pulse" size={24} />
            <p className="text-[10px] uppercase font-bold text-neutral-400">Ledger awaiting socket events...</p>
            <p className="text-[9px] text-zinc-600 uppercase">Trigger a Simulated Gateway checkout above. Paid invoices generate webhook web-sockets instantly.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4 select-text">
            {webhookLogs.map((log, idx) => (
              <div key={idx} className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl space-y-2 font-mono text-xs">
                
                <div className="flex justify-between items-center text-[10px] border-b border-neutral-850 pb-2">
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    ✓ {log.action}
                  </span>
                  <span className="text-neutral-500">{log.timestamp}</span>
                </div>

                <div className="text-[9px] text-zinc-400 grid grid-cols-2 gap-4">
                  <div>
                    <strong className="text-yellow-500 uppercase block font-mono text-[8px] mb-1">Trigger Endpoint:</strong>
                    POST /api/chargily-pay/webhook
                  </div>
                  <div>
                    <strong className="text-yellow-505 uppercase block font-mono text-[8px] mb-1">Verify HMAC signature:</strong>
                    HTTP_X_SIGNATURE === hash_hmac('sha256', raw_body, CHARGILY_SECRET_KEY)
                  </div>
                </div>

                <pre className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl text-[10px] text-yellow-500 font-mono overflow-x-auto select-all leading-normal whitespace-pre">
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOCK CHARGILY CHECKOUT MODAL WINDOW */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur px-4 flex items-center justify-center animate-fadeIn select-text">
          <div className="bg-neutral-900 max-w-md w-full rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden font-mono flex flex-col justify-between">
            
            {/* Checkout Header representation */}
            <div className="bg-[#181a1b] p-5 border-b border-neutral-800/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center font-black text-neutral-950 text-xs">
                  C
                </div>
                <div>
                  <h4 className="text-xs font-black text-white leading-tight uppercase font-space">Chargily Pay Checkout</h4>
                  <p className="text-[9px] text-neutral-500 whitespace-nowrap leading-none uppercase">Verified DZ merchant transaction</p>
                </div>
              </div>

              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-neutral-500 hover:text-white text-xs border border-neutral-800 hover:bg-neutral-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* In-app Checkout Screen contents */}
            <div className="p-6 space-y-5">
              
              {/* Checkout Merchant Order details */}
              <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase leading-none">ORDER TOTAL VALUE</span>
                  <span className="text-base font-black text-yellow-500 mt-1 block">
                    {depositAmount.toLocaleString()} DZD
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-neutral-500 block uppercase leading-none font-bold">MERCHANT ACCOUNT</span>
                  <span className="text-[10px] text-white font-extrabold block mt-1 uppercase">
                    eFT Trade DZ Inc.
                  </span>
                </div>
              </div>

              {isProcessing && (
                <div className="py-12 text-center space-y-4">
                  <RefreshCw size={36} className="text-yellow-500 animate-spin mx-auto" />
                  <div>
                    <span className="text-xs text-white uppercase block font-extrabold font-mono text-[10px]">Processing Transaction keys...</span>
                    <span className="text-[9px] text-neutral-400 uppercase mt-1 block">Verifying card signatures via Algérie Poste APIs...</span>
                  </div>
                </div>
              )}

              {isPaymentConfirmed && (
                <div className="py-12 text-center space-y-4 animate-bounce">
                  <CheckCircle size={40} className="text-emerald-500 mx-auto font-black" />
                  <div>
                    <span className="text-xs text-emerald-400 uppercase block font-extrabold font-mono text-[11px]">Payment holding Successful!</span>
                    <span className="text-[9px] text-neutral-400 uppercase mt-1 block">Invoking callback parameters and dispatching webhooks...</span>
                  </div>
                </div>
              )}

              {(!isProcessing && !isPaymentConfirmed) && (
                <div className="space-y-4 text-xs font-mono">
                  
                  {/* Gateway specifics */}
                  {selectedGateway === 'chargily_baridimob' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-black">Baridi Mob RIP Number (1.5-digit)</span>
                        <input
                          type="text"
                          value={phoneRIP}
                          onChange={(e) => setPhoneRIP(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-zinc-300 font-bold"
                          placeholder="e.g., 007999990022345678"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-black">Postal RIP Holder Name</span>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-zinc-300 font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {(selectedGateway === 'chargily_edahabia' || selectedGateway === 'chargily_cib') && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-black">Algerian Debit Card Number</span>
                        <input
                          type="text"
                          value={phoneCIB}
                          onChange={(e) => setPhoneCIB(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-zinc-300 font-bold"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 col-span-2">
                          <span className="text-[9px] text-zinc-500 uppercase font-black">Card Holder Name</span>
                          <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-zinc-300 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-500 uppercase font-black">CVV</span>
                          <input
                            type="text"
                            defaultValue="112"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-zinc-300 font-bold"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGateway === 'stripe' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-black">International Visa / Mastercard (Placeholder)</span>
                        <input
                          type="text"
                          defaultValue="4242 4242 4242 4242"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-[11px] text-zinc-300 font-bold"
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-neutral-500 font-mono text-[10px]">
                        <span>Exp: 12 / 2028</span>
                        <span>CVV: 312 (Sandbox)</span>
                      </div>
                    </div>
                  )}

                  {/* SMS Verifying Code OTP representation */}
                  <div className="bg-neutral-950 p-4 border border-neutral-850 rounded-2xl space-y-2">
                    <span className="text-[9px] text-zinc-500 block font-black uppercase">Algérie Poste OTP Verification Code</span>
                    <input
                      type="text"
                      value={optSMSCode}
                      onChange={(e) => setOptSMSCode(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-center text-xs text-yellow-400 font-bold"
                      placeholder="e.g., DZ-2026"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmMockupPayment}
                    className="w-full bg-yellow-500 hover:bg-yellow-555 text-neutral-950 font-sans font-bold py-3.5 rounded-2xl transition-all shadow text-xs uppercase cursor-pointer block text-center"
                  >
                    🚀 AUTHORIZE PAYMENT & WEBHOOK
                  </button>
                </div>
              )}

            </div>

            {/* Disclaimer in footer of Chargily Mock */}
            <div className="bg-[#181a1b] p-3 text-center text-[8px] text-zinc-500 border-t border-neutral-800 uppercase">
              🔒 Chargily merchant sandbox checkout protocol linked securely in DZD.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
