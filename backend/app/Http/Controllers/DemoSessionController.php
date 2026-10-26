<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Database\Seeders\DemoSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DemoSessionController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, DemoSeeder $seeder): JsonResponse
    {
        $user = $seeder->reset();

        Auth::login($user);
        $request->session()->regenerate();

        return (new UserResource($user))->response()->setStatusCode(200);
    }
}
