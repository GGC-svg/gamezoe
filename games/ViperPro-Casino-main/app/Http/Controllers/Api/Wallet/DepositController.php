<?php

namespace App\Http\Controllers\Api\Wallet;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Traits\Gateways\SuitpayTrait;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    use SuitpayTrait;

    /**
     * @param Request $request
     * @return array|false[]
     */
    public function submitPayment(Request $request)
    {
        switch ($request->gateway) {
            case 'suitpay':
                return self::requestQrcode($request);
            
            case 'gamezoe':
                return $this->processGameZoeDeposit($request);
        }
    }

    /**
     * Process GameZoe Deposit (Gold -> Casino Balance)
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    private function processGameZoeDeposit(Request $request)
    {
        $amount = $request->amount;
        $user = auth('api')->user();

        if ($amount <= 0) {
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post(env('BRIDGE_API_URL') . '/transfer', [
                'headers' => [
                    'x-api-key' => env('BRIDGE_API_KEY'),
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'userId' => $user->email, // Using email as the link for now, assuming GameZoe userId matches or we map it
                    'amount' => $amount,
                    'type' => 'DEPOSIT', // DEPOSIT means DEDUCT from GameZoe (Player Deposits into Game)
                    'externalRef' => 'VP-' . \Illuminate\Support\Str::uuid(),
                    'description' => 'Deposit to ViperPro Casino',
                ]
            ]);

            $body = json_decode($response->getBody(), true);

            if (isset($body['success']) && $body['success']) {
                // Bridge success: Credit user in ViperPro
                $wallet = \App\Models\Wallet::where('user_id', $user->id)->first();
                if($wallet) {
                    $wallet->increment('balance', $amount);
                }

                $deposit = Deposit::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'type' => 'deposit',
                    'currency' => $wallet->currency ?? 'USD',
                    'symbol' => $wallet->symbol ?? '$',
                    'status' => 'paid', // Instant success
                    'payment_id' => $body['txId'] ?? 'GAMEZOE',
                ]);

                return response()->json([
                    'status' => true,
                    'message' => 'Deposit successful',
                    'id' => $deposit->id
                ]);
            } else {
                return response()->json(['error' => 'Bridge transaction failed: ' . ($body['error'] ?? 'Unknown')], 400);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => 'Connection error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function consultStatusTransactionPix(Request $request)
    {
        return self::consultStatusTransaction($request);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $deposits = Deposit::whereUserId(auth('api')->id())->paginate();
        return response()->json(['deposits' => $deposits], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
