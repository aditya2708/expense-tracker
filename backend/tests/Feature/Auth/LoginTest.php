<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user can log in with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ]);

    $response = $this->from('http://localhost')->postJson('/api/v1/auth/login', [
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.email', 'budi@example.com');

    $this->assertAuthenticatedAs($user);
});

test('login is rejected with wrong credentials', function () {
    User::factory()->create([
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ]);

    $response = $this->from('http://localhost')->postJson('/api/v1/auth/login', [
        'email' => 'budi@example.com',
        'password' => 'salah',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    $this->assertGuest();
});
