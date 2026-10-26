<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an authenticated user can fetch their profile', function () {
    $user = User::factory()->create([
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ]);

    $this->from('http://localhost')->postJson('/api/v1/auth/login', [
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ])->assertOk();

    $this->getJson('/api/v1/auth/user')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', 'budi@example.com');
});

test('a guest cannot fetch the profile', function () {
    $this->getJson('/api/v1/auth/user')->assertUnauthorized();
});

test('api guests receive 401 instead of a redirect', function () {
    $this->get('/api/v1/auth/user')->assertUnauthorized();
});

test('a guest cannot log out', function () {
    $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
});

test('a user can log out', function () {
    User::factory()->create([
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ]);

    $this->from('http://localhost')->postJson('/api/v1/auth/login', [
        'email' => 'budi@example.com',
        'password' => 'rahasia123',
    ])->assertOk();

    $this->postJson('/api/v1/auth/logout')->assertNoContent();

    $this->assertGuest('web');

    // The HTTP kernel is not rebooted between test requests, so cached guards must be cleared.
    $this->app['auth']->forgetGuards();

    $this->getJson('/api/v1/auth/user')->assertUnauthorized();
});
