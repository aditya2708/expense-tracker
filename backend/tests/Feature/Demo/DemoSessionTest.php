<?php

use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    Carbon::setTestNow('2026-10-21 10:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

test('a guest can start a demo session with seeded data', function () {
    $response = $this->from('http://localhost')
        ->postJson('/api/v1/demo-session');

    $response->assertOk()
        ->assertJsonPath('data.email', DemoSeeder::EMAIL);

    $demo = User::where('email', DemoSeeder::EMAIL)->sole();

    expect($demo->categories)->toHaveCount(6)
        ->and($demo->expenses)->toHaveCount(30)
        ->and($demo->expenses->contains(
            fn ($expense): bool => $expense->occurred_on->toDateString() === '2026-10-21'
        ))->toBeTrue();

    $this->assertAuthenticatedAs($demo);
});

test('starting a demo session resets previous demo data', function () {
    $this->from('http://localhost')
        ->postJson('/api/v1/demo-session')
        ->assertOk();

    $demo = User::where('email', DemoSeeder::EMAIL)->sole();
    $firstTotal = (int) $demo->expenses()->sum('amount');

    $demo->expenses()->create([
        'category_id' => $demo->categories()->first()->id,
        'amount' => 999999,
        'occurred_on' => '2026-10-21',
    ]);
    $demo->categories()->create(['name' => 'Kategori Nyasar']);

    $this->from('http://localhost')
        ->postJson('/api/v1/demo-session')
        ->assertOk();

    $demo->refresh();

    expect($demo->expenses()->count())->toBe(30)
        ->and($demo->categories()->count())->toBe(6)
        ->and((int) $demo->expenses()->sum('amount'))->toBe($firstTotal)
        ->and($demo->categories()->where('name', 'Kategori Nyasar')->exists())->toBeFalse();
});

test('the demo session is rate limited per ip', function () {
    for ($attempt = 0; $attempt < 3; $attempt++) {
        $this->from('http://localhost')
            ->postJson('/api/v1/demo-session')
            ->assertOk();
    }

    $this->from('http://localhost')
        ->postJson('/api/v1/demo-session')
        ->assertStatus(429);
});

test('the demo reset command prepares the demo account', function () {
    $this->artisan('demo:reset')->assertSuccessful();

    $demo = User::where('email', DemoSeeder::EMAIL)->sole();

    expect($demo->categories)->toHaveCount(6)
        ->and($demo->expenses)->toHaveCount(30);
});
