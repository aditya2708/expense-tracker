<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a guest can register and receives default categories', function () {
    $response = $this->from('http://localhost')->postJson('/api/v1/auth/register', [
        'name' => 'Budi Santoso',
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
        'password_confirmation' => 'rahasia123',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Budi Santoso')
        ->assertJsonPath('data.email', 'budi@example.com')
        ->assertJsonMissingPath('data.password');

    $user = User::where('email', 'budi@example.com')->sole();

    expect($user->categories()->orderBy('id')->pluck('name')->all())
        ->toBe(['Makan', 'Transport', 'Tagihan', 'Belanja', 'Kesehatan', 'Lainnya']);

    $this->assertAuthenticatedAs($user);
});

test('registration rejects invalid and duplicate data', function () {
    User::factory()->create(['email' => 'budi@example.com']);

    $response = $this->from('http://localhost')->postJson('/api/v1/auth/register', [
        'name' => '',
        'email' => 'budi@example.com',
        'password' => 'short',
        'password_confirmation' => 'different',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'password']);
});
