<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. USERS
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role_id')->default('user'); // Guessing format
            $table->string('avatar')->nullable();
            $table->string('last_name')->nullable();
            $table->string('cpf')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('logged_in')->default(false);
            $table->boolean('banned')->default(false);
            $table->unsignedBigInteger('inviter')->nullable();
            $table->string('inviter_code')->nullable();
            $table->decimal('affiliate_revenue_share', 10, 2)->default(0);
            $table->decimal('affiliate_revenue_share_fake', 10, 2)->default(0);
            $table->decimal('affiliate_cpa', 10, 2)->default(0);
            $table->decimal('affiliate_baseline', 10, 2)->default(0);
            $table->boolean('is_demo_agent')->default(false);
            $table->boolean('is_admin')->default(false);
            $table->string('language')->default('en');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. WALLETS
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('currency')->default('USD');
            $table->string('symbol')->default('$');
            $table->decimal('balance', 20, 2)->default(0);
            $table->decimal('balance_withdrawal', 20, 2)->default(0);
            $table->decimal('balance_deposit_rollover', 20, 2)->default(0);
            $table->decimal('balance_bonus', 20, 2)->default(0);
            $table->decimal('balance_bonus_rollover', 20, 2)->default(0);
            $table->decimal('balance_cryptocurrency', 20, 8)->default(0);
            $table->decimal('balance_demo', 20, 2)->default(0);
            $table->decimal('refer_rewards', 20, 2)->default(0);
            $table->decimal('total_bet', 20, 2)->default(0);
            $table->decimal('total_won', 20, 2)->default(0);
            $table->decimal('total_lose', 20, 2)->default(0);
            $table->decimal('last_won', 20, 2)->default(0);
            $table->decimal('last_lose', 20, 2)->default(0);
            $table->boolean('hide_balance')->default(false);
            $table->boolean('active')->default(true);
            $table->integer('vip_level')->default(0);
            $table->integer('vip_points')->default(0);
            $table->timestamps();
        });

        // 3. DEPOSITS
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->string('payment_id')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 20, 2);
            $table->string('type')->default('deposit');
            $table->string('proof')->nullable();
            $table->string('currency')->default('USD');
            $table->string('symbol')->default('$');
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        // 4. WITHDRAWALS
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->string('payment_id')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 20, 2);
            $table->string('type')->default('withdrawal');
            $table->string('bank_info')->nullable();
            $table->string('proof')->nullable();
            $table->string('pix_key')->nullable();
            $table->string('pix_type')->nullable();
            $table->string('currency')->default('USD');
            $table->string('symbol')->default('$');
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        // 5. GAMES
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            // Provider ID is nullable because we haven't created the providers table
            $table->unsignedBigInteger('provider_id')->nullable(); 
            $table->string('game_server_url')->nullable();
            $table->string('game_id')->unique(); // External Game ID
            $table->string('game_name');
            $table->string('game_code')->nullable();
            $table->string('game_type')->nullable(); // slot, live, etc
            $table->text('description')->nullable();
            $table->string('cover')->nullable();
            $table->boolean('status')->default(true);
            $table->string('technology')->default('html5');
            $table->boolean('has_lobby')->default(false);
            $table->boolean('is_mobile')->default(true);
            $table->boolean('has_freespins')->default(false);
            $table->boolean('has_tables')->default(false);
            $table->boolean('only_demo')->default(false);
            $table->integer('rtp')->default(95);
            $table->string('distribution')->default('casino');
            $table->integer('views')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('show_home')->default(true);
            $table->timestamps();
        });

        // 6. TRANSACTIONS (Inferred from common sense, as model file wasn't fully inspected but referenced)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('type'); // deposit, withdraw, bet, win
            $table->decimal('amount', 20, 2);
            $table->decimal('balance_before', 20, 2)->default(0);
            $table->decimal('balance_after', 20, 2)->default(0);
            $table->string('reference_id')->nullable(); // Game ID or Payment ID
            $table->timestamps();
        });

         // 7. ROLES (Minimal for simple auth)
         Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name')->default('web');
            $table->timestamps();
        });
        
         // 8. MODEL_HAS_ROLES (For Spatie Permission)
         Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->index(['model_id', 'model_type']);
            $table->primary(['role_id', 'model_id', 'model_type']);
        });

        // 9. PROVIDERS (Minimal)
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
        
        // 10. CATEGORIES (Minimal)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->timestamps();
        });

        // 11. GAME_CATEGORY (Pivot)
        Schema::create('category_game', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
        });

        // 12. CURRENCIES
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('symbol');
            $table->timestamps();
        });

        // 13. SETTINGS
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('software_name')->default('ViperPro Casino');
            $table->text('software_description')->nullable();
            
            // Logos
            $table->string('software_favicon')->nullable();
            $table->string('software_logo_white')->nullable();
            $table->string('software_logo_black')->nullable();
            $table->string('software_background')->nullable();

            // Currency
            $table->string('currency_code')->default('USD');
            $table->string('decimal_format')->default('dot');
            $table->string('currency_position')->default('left');
            $table->string('prefix')->default('$');
            $table->string('storage')->default('local');
            
            // Limits
            $table->decimal('min_deposit', 20, 2)->default(10);
            $table->decimal('max_deposit', 20, 2)->default(10000);
            $table->decimal('min_withdrawal', 20, 2)->default(20);
            $table->decimal('max_withdrawal', 20, 2)->default(5000);
            
            // VIP
            $table->decimal('bonus_vip', 20, 2)->default(0);
            $table->boolean('activate_vip_bonus')->default(false);

            // Access/Percent
            $table->decimal('ngr_percent', 5, 2)->default(0);
            $table->decimal('revshare_percentage', 5, 2)->default(0);
            $table->boolean('revshare_reverse')->default(false);

            // Soccer
            $table->decimal('soccer_percentage', 5, 2)->default(0);
            $table->boolean('turn_on_football')->default(false);

            // Bonus
            $table->decimal('initial_bonus', 20, 2)->default(0);
            $table->integer('rollover')->default(1);
            $table->integer('rollover_deposit')->default(1);

            // Gates
            $table->boolean('suitpay_is_enable')->default(false);
            $table->boolean('stripe_is_enable')->default(false);
            $table->boolean('bspay_is_enable')->default(false);

            // Limits 2
            $table->decimal('withdrawal_limit', 20, 2)->default(0);
            $table->string('withdrawal_period')->default('daily');
            
            $table->boolean('disable_spin')->default(false);

            // Sub Affiliate
            $table->decimal('perc_sub_lv1', 5, 2)->default(0);
            $table->decimal('perc_sub_lv2', 5, 2)->default(0);
            $table->decimal('perc_sub_lv3', 5, 2)->default(0);

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('currencies');
        Schema::dropIfExists('category_game');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('providers');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('games');
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('deposits');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('users');
    }
};
