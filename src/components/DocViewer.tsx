import { useState } from 'react';
import { Database, FileCode, Landmark, ShieldCheck, Copy, Check, Info } from 'lucide-react';

export default function DocViewer() {
  const [activeSubTab, setActiveSubTab] = useState<'guide' | 'database' | 'models-routes' | 'controllers'>('guide');

  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Code snippets
  const snDatabase = `// database/migrations/2026_06_06_000000_create_base_marketplace_tables.php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

class CreateBaseMarketplaceTables extends Migration
{
    public function up()
    {
        // 1. Listings Table (Holds account metadata + locked Konami keys)
        Schema::create('listings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('platform', ['Mobile', 'PC', 'Console']);
            $table->integer('team_strength')->default(3000);
            $table->integer('division')->default(1);
            $table->integer('legends_count')->default(0);
            $table->integer('epics_count')->default(0);
            $table->decimal('price', 12, 2); // Price in DZD
            $table->enum('status', ['active', 'escrow', 'sold', 'inactive'])->default('active');
            
            // Credentials Vault columns encrypted dynamically in DB
            $table->string('account_login_id_encrypted'); 
            $table->string('account_password_encrypted');
            $table->string('game_id'); // Profile ID / display name
            $table->timestamps();
        });

        // 2. Escrow Transactions (Locks payments & regulates releases)
        Schema::create('escrow_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('listing_id');
            $table->foreign('listing_id')->references('id')->on('listings')->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('seller_id')->constrained('users');
            
            $table->enum('status', [
                'awaiting_payment', 
                'funds_held', 
                'credentials_released', 
                'completed', 
                'disputed', 
                'cancelled'
            ])->default('awaiting_payment');
            
            $table->decimal('locked_funds', 12, 2);
            $table->decimal('commission_deducted', 12, 2); // 10% fee
            $table->decimal('payout_amount', 12, 2);       // 90% payout
            
            $table->boolean('credentials_visible')->default(false);
            $table->boolean('buyer_confirmed_receipt')->default(false);
            $table->timestamps();
        });

        // 3. Payments Ledger (Chargily Payments + Local Deposits)
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->decimal('amount', 12, 2);
            $table->enum('type', ['deposit', 'payout', 'purchase', 'earned']);
            $table->string('gateway'); // chargily_baridimob, chargily_edahabia, etc.
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('tx_reference')->unique();
            $table->timestamps();
        });

        // 4. Ratings & Reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('listing_id');
            $table->foreignId('from_id')->constrained('users');
            $table->foreignId('to_seller_id')->constrained('users');
            $table->integer('rating'); // 1-5
            $table->text('comment');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('escrow_transactions');
        Schema::dropIfExists('listings');
    }
}`;

  const snModels = `// App/Models/Listing.php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Facades\\Crypt;

class Listing extends Model
{
    protected $fillable = [
        'seller_id', 'title', 'description', 'platform', 
        'team_strength', 'division', 'legends_count', 'epics_count', 
        'price', 'status', 'account_login_id_encrypted', 
        'account_password_encrypted', 'game_id'
    ];

    // Accessors and Mutators for securing Konami Keys using AES-256
    public function setAccountLoginIdAttribute($value) {
        $this->attributes['account_login_id_encrypted'] = Crypt::encryptString($value);
    }

    public function getAccountLoginIdDecryptedAttribute() {
        return Crypt::decryptString($this->attributes['account_login_id_encrypted']);
    }

    public function setAccountPasswordAttribute($value) {
        $this->attributes['account_password_encrypted'] = Crypt::encryptString($value);
    }

    public function getAccountPasswordDecryptedAttribute() {
        return Crypt::decryptString($this->attributes['account_password_encrypted']);
    }

    public function seller() {
        return $this->belongsTo(User::class, 'seller_id');
    }
}

// App/Models/EscrowTransaction.php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class EscrowTransaction extends Model
{
    protected $fillable = [
        'listing_id', 'buyer_id', 'seller_id', 'status', 
        'locked_funds', 'commission_deducted', 'payout_amount', 
        'credentials_visible', 'buyer_confirmed_receipt'
    ];

    public function listing() {
        return $this->belongsTo(Listing::class);
    }

    public function buyer() {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller() {
        return $this->belongsTo(User::class, 'seller_id');
    }
}

// routes/api.php
use App\\Http\\Controllers\\ChargilyPayController;
use App\\Http\\Controllers\\EscrowController;

// Webhook endpoint called by Chargily Pay servers asynchronously
Route::post('/chargily-pay/webhook', [ChargilyPayController::class, 'handleWebhook']);

Route::middleware('auth:sanctum')->group(function () {
    // Escrow management routes
    Route::post('/escrow/buy/{listing}', [EscrowController::class, 'initiateEscrow']);
    Route::post('/escrow/{escrow}/release', [EscrowController::class, 'releaseFunds']);
    Route::post('/escrow/{escrow}/messages', [EscrowController::class, 'sendMessage']);
});`;

  const snControllers = `// App/Http/Controllers/ChargilyPayController.php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\User;
use App\\Models\\Payment;
use Illuminate\\Support\\Facades\\Log;

class ChargilyPayController extends Controller
{
    /**
     * Handle asynchronous Webhook confirmations dispatched by Chargily
     * Implements HMAC signature checking for secure credential validations.
     */
    public function handleWebhook(Request $request)
    {
        $signature = $request->header('Signature');
        $payload = $request->getContent();
        $secretKey = env('CHARGILY_SECRET_KEY');

        // 1. Signature check to prevent spoofing
        if (!$signature) {
             return response()->json(['error' => 'No signature provided'], 400);
        }

        $computedSignature = hash_hmac('sha256', $payload, $secretKey);

        if (!hash_equals($computedSignature, $signature)) {
            Log::error('Chargily Webhook signature verification failed!');
            return response()->json(['error' => 'Signature verification failed'], 401);
        }

        $event = json_decode($payload, true);

        // 2. Process check and add funds
        if ($event['event'] === 'checkout.paid') {
            $data = $event['data'];
            $userId = $data['metadata']['user_id'];
            $amount = $data['amount_to_pay'];
            $ref = $data['metadata']['deposit_ref'];

            // Look up existing pending ledger record
            $payment = Payment::where('tx_reference', $ref)->first();
            if ($payment && $payment->status === 'pending') {
                $payment->update(['status' => 'completed']);
                
                // Credited buyer wallet balance
                $user = User::find($userId);
                $user->increment('wallet_balance', $amount);

                Log::info("User ID {$userId} wallet credited with {$amount} DZD via webhook reference {$ref}");
            }
        }

        return response()->json(['status' => 'success']);
    }
}

// App/Http/Controllers/EscrowController.php
namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\Listing;
use App\\Models\\EscrowTransaction;
use Illuminate\\Support\\Facades\\DB;

class EscrowController extends Controller
{
    /**
     * Step 1: Securely initiate an Escrow transaction
     */
    public function initiateEscrow(Request $request, Listing $listing)
    {
        $buyer = $request->user();

        if ($listing->status !== 'active') {
            return response()->json(['error' => 'Listing is no longer active'], 400);
        }

        if ($buyer->wallet_balance < $listing->price) {
            return response()->json(['error' => 'Insufficient wallet balance. Top up via Chargily first.'], 400);
        }

        // Transactions wrapped inside database lock ensuring strict atomicity
        DB::transaction(function () use ($buyer, $listing) {
            // Deduct funds from buyer wallet and lock them in platform
            $buyer->decrement('wallet_balance', $listing->price);
            $listing->update(['status' => 'escrow']);

            // Calculate exact platform commission (10%) and seller payout (90%)
            $commission = $listing->price * 0.10;
            $payout = $listing->price * 0.90;

            EscrowTransaction::create([
                'listing_id' => $listing->id,
                'buyer_id' => $buyer->id,
                'seller_id' => $listing->seller_id,
                'status' => 'funds_held', // Funds now held securely by eFT Trade
                'locked_funds' => $listing->price,
                'commission_deducted' => $commission,
                'payout_amount' => $payout,
                'credentials_visible' => true, // Revealed to buyer ONLY now!
                'buyer_confirmed_receipt' => false
            ]);
        });

        return response()->json(['message' => 'Escrow locked. Credentials revealed. Chat initialized.']);
    }

    /**
     * Step 2: Release Locked payment to seller on buyer validation
     */
    public function releaseFunds(Request $request, EscrowTransaction $escrow)
    {
        $buyer = $request->user();

        if ($escrow->buyer_id !== $buyer->id) {
            return response()->json(['error' => 'Unauthorized action'], 403);
        }

        if ($escrow->status !== 'funds_held') {
            return response()->json(['error' => 'Escrow details are in wrong state.'], 400);
        }

        DB::transaction(function () use ($escrow) {
            $seller = $escrow->seller;
            
            // Credited Seller's profile after 10% fee
            $seller->increment('wallet_balance', $escrow->payout_amount);
            
            // Mark escrow as closed & settle listing as sold
            $escrow->update([
                'status' => 'completed',
                'buyer_confirmed_receipt' => true
            ]);
            
            $escrow->listing->update(['status' => 'sold']);
        });

        return response()->json(['message' => 'Funds released. Transaction completed successfully!']);
    }
}`;

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher strip */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl gap-2 font-mono scroll-x-auto max-w-full">
        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex-grow py-2 text-xs font-bold rounded-xl transition-all ${activeSubTab === 'guide' ? 'bg-yellow-500 text-neutral-950 px-4' : 'text-neutral-400 hover:text-white'}`}
        >
          📖 Escrow Integration Guide
        </button>
        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex-grow py-2 text-xs font-bold rounded-xl transition-all ${activeSubTab === 'database' ? 'bg-yellow-500 text-neutral-950 px-4' : 'text-neutral-400 hover:text-white'}`}
        >
          📂 DB Migrations
        </button>
        <button
          onClick={() => setActiveSubTab('models-routes')}
          className={`flex-grow py-2 text-xs font-bold rounded-xl transition-all ${activeSubTab === 'models-routes' ? 'bg-yellow-500 text-neutral-950 px-4' : 'text-neutral-400 hover:text-white'}`}
        >
          📝 Models & Routes
        </button>
        <button
          onClick={() => setActiveSubTab('controllers')}
          className={`flex-grow py-2 text-xs font-bold rounded-xl transition-all ${activeSubTab === 'controllers' ? 'bg-yellow-500 text-neutral-950 px-4' : 'text-neutral-400 hover:text-white'}`}
        >
          ⚙️ Laravel Controllers
        </button>
      </div>

      {/* SUB TAB: COMPREHENSIVE IMPLEMENTATION GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-5">
          <h2 className="text-sm font-space font-black text-white px-2.5 border-b border-neutral-800 pb-3 uppercase flex items-center gap-2">
            <ShieldCheck className="text-yellow-500" size={18} /> Step-by-Step Security Integration & Escrow Flow
          </h2>

          <div className="space-y-4 text-xs font-sans leading-relaxed text-zinc-300">
            <p>
              This developer guide outlines how to configure **Chargily Pay** to safely hold gamer funds inside an intermediate platform escrow layer before releasing them to eFootball account sellers.
            </p>

            {/* Steps panel list */}
            <div className="space-y-3 font-mono text-[11px] uppercase">
              
              <div className="p-4 bg-neutral-950 border-l-4 border-yellow-500 rounded-r-2xl space-y-1.5">
                <span className="text-yellow-405 font-black block">1. SECURE ACCOUNTS LISTING</span>
                <p className="font-sans lowercase first-letter:uppercase text-zinc-400 text-xs">
                  Sellers submit eFootball gaming details along with their **encrypted credentials** (Konami ID & Password). These credentials are encrypted inside the MySQL database using Laravel's native <code className="bg-neutral-900 px-1 py-0.5 rounded text-yellow-500 text-[10px] font-mono">Crypt::encryptStringString()</code>.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border-l-4 border-yellow-500 rounded-r-2xl space-y-1.5">
                <span className="text-yellow-405 font-black block">2. DEPOSIT & CHECKOUT via CHARGILY PAY API</span>
                <p className="font-sans lowercase first-letter:uppercase text-zinc-400 text-xs">
                  Buyers purchase using funds or top-up directly. Programmatically make a POST request to <code className="bg-neutral-900 px-1 py-0.5 rounded text-yellow-500 text-[10px] font-mono">https://pay.chargily.com/test/api/v2/checkouts</code> specifying currency <code className="text-white">"dzd"</code> and payment method <code className="text-white">"baridimob"</code>, <code className="text-white">"edahabia"</code> or <code className="text-white">"cib"</code>. Pass the buyer ID and metadata in the request.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border-l-4 border-yellow-500 rounded-r-2xl space-y-1.5">
                <span className="text-yellow-405 font-black block">3. THE WEBHOOK DISPATCH (ESCROW SECURED)</span>
                <p className="font-sans lowercase first-letter:uppercase text-zinc-400 text-xs">
                  When the buyer completes DZ checkout, Chargily pay signals our webhook route <code className="text-yellow-500 font-mono text-[10px]">/api/chargily-pay/webhook</code>. Verify the callback integrity by checking the Header <code className="text-white">Signature</code> matching the SHA256 HMAC of the body using the merchant API secret key.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border-l-4 border-yellow-500 rounded-r-2xl space-y-1.5">
                <span className="text-yellow-405 font-black block">4. SECURED TRANSFERS & CONFIRM RECEIPTS</span>
                <p className="font-sans lowercase first-letter:uppercase text-zinc-400 text-xs">
                  Upon webhook validation, the platform flags the transaction as **"funds_held"** and reveals credentials securely in the buyer portal. The buyer logs in, updates Konami ID unlinks, then clicks **"Confirm & Release"**.
                </p>
              </div>

              <div className="p-4 bg-neutral-950 border-l-4 border-yellow-500 rounded-r-2xl space-y-1.5">
                <span className="text-yellow-405 font-black block">5. AUTOMATED 10% COMMISSION DISTRIBUTION</span>
                <p className="font-sans lowercase first-letter:uppercase text-zinc-400 text-xs">
                  When settling, the system computes $Comm = Listing \times 10\%$. The remaining $90\%$ gets added to the seller's active wallet balance automatically, with database audit trail ledgers created.
                </p>
              </div>

            </div>

            {/* Additional gateway expandable info block */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 space-y-2">
              <span className="text-xs text-white font-extrabold flex items-center gap-1.5">
                <Info size={14} className="text-yellow-500" /> Scalability to Stripe and Other Providers
              </span>
              <p className="font-sans text-xs text-neutral-400">
                To integrate **Stripe**, you can create a common abstract interface class <code className="bg-neutral-900 px-1 text-yellow-500 rounded">PaymentGatewayInterface</code> containing a <code className="font-mono">createCheckout()</code> method. Implement this on both <code className="font-mono">ChargilyPayGateway</code> and <code className="font-mono">StripeGateway</code>. Swapping payment mechanisms then becomes a simple configuration swap in the environment profile!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: MIGRATIONS CODE BLOCK */}
      {activeSubTab === 'database' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <span className="font-mono text-xs text-neutral-400 flex items-center gap-1.5">
              <Database size={13} className="text-yellow-500" /> laravel migrations (.php)
            </span>
            <button
              onClick={() => handleCopy(snDatabase, 'db')}
              className="text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-xl hover:bg-neutral-850 flex items-center gap-1.5 text-zinc-300"
            >
              {copiedText === 'db' ? <Check className="text-emerald-500" size={12} /> : <Copy size={12} />}
              {copiedText === 'db' ? 'Copied code!' : 'Copy Codeblock'}
            </button>
          </div>
          <pre className="p-5 bg-neutral-950 border border-neutral-850 text-yellow-500 rounded-3xl text-[11px] font-mono overflow-auto max-h-[450px] leading-relaxed select-all">
            {snDatabase}
          </pre>
        </div>
      )}

      {/* SUB TAB: MODELS AND ROUTES */}
      {activeSubTab === 'models-routes' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <span className="font-mono text-xs text-neutral-400 flex items-center gap-1.5">
              <FileCode size={13} className="text-yellow-500" /> models and api router configuration
            </span>
            <button
              onClick={() => handleCopy(snModels, 'mod')}
              className="text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-xl hover:bg-neutral-850 flex items-center gap-1.5 text-zinc-300"
            >
              {copiedText === 'mod' ? <Check className="text-emerald-500" size={12} /> : <Copy size={12} />}
              {copiedText === 'mod' ? 'Copied code!' : 'Copy Codeblock'}
            </button>
          </div>
          <pre className="p-5 bg-neutral-950 border border-neutral-850 text-yellow-500 rounded-3xl text-[11px] font-mono overflow-auto max-h-[450px] leading-relaxed select-all">
            {snModels}
          </pre>
        </div>
      )}

      {/* SUB TAB: CONTROLLERS */}
      {activeSubTab === 'controllers' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <span className="font-mono text-xs text-neutral-400 flex items-center gap-1.5">
              <FileCode size={13} className="text-yellow-500" /> chargily pay & escrow controller codes
            </span>
            <button
              onClick={() => handleCopy(snControllers, 'contr')}
              className="text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-xl hover:bg-neutral-850 flex items-center gap-1.5 text-zinc-300"
            >
              {copiedText === 'contr' ? <Check className="text-emerald-500" size={12} /> : <Copy size={12} />}
              {copiedText === 'contr' ? 'Copied code!' : 'Copy Codeblock'}
            </button>
          </div>
          <pre className="p-5 bg-neutral-950 border border-neutral-850 text-yellow-500 rounded-3xl text-[11px] font-mono overflow-auto max-h-[450px] leading-relaxed select-all">
            {snControllers}
          </pre>
        </div>
      )}

    </div>
  );
}
