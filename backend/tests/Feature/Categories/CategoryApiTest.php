<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a guest cannot list categories', function () {
    $this->getJson('/api/v1/categories')->assertUnauthorized();
});

test('a user only sees their own categories', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']);
    Category::factory()->create(['user_id' => $otherUser->id, 'name' => 'Rahasia']);

    $this->actingAs($user)
        ->getJson('/api/v1/categories')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Makan');
});

test('a user can create a category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/categories', ['name' => 'Hiburan'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Hiburan');

    expect($user->categories()->where('name', 'Hiburan')->exists())->toBeTrue();
});

test('a category name must be unique per user', function () {
    $user = User::factory()->create();
    Category::factory()->create(['user_id' => $user->id, 'name' => 'Hiburan']);

    $this->actingAs($user)
        ->postJson('/api/v1/categories', ['name' => 'Hiburan'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name')
        ->assertJsonPath('errors.name.0', 'Nama sudah digunakan.');
});

test('a user can reuse a category name owned by another user', function () {
    $otherUser = User::factory()->create();
    Category::factory()->create(['user_id' => $otherUser->id, 'name' => 'Hiburan']);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/categories', ['name' => 'Hiburan'])
        ->assertCreated();
});

test('a user can rename their category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']);

    $this->actingAs($user)
        ->patchJson("/api/v1/categories/{$category->id}", ['name' => 'Makanan'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Makanan');

    expect($category->refresh()->name)->toBe('Makanan');
});

test('a user cannot rename another user\'s category', function () {
    $owner = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $owner->id, 'name' => 'Makan']);

    $intruder = User::factory()->create();

    $this->actingAs($intruder)
        ->patchJson("/api/v1/categories/{$category->id}", ['name' => 'Diambil alih'])
        ->assertForbidden();

    expect($category->refresh()->name)->toBe('Makan');
});

test('renaming to a name that already exists is rejected', function () {
    $user = User::factory()->create();
    Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']);
    $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'Transport']);

    $this->actingAs($user)
        ->patchJson("/api/v1/categories/{$category->id}", ['name' => 'Makan'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('name');
});

test('renaming a category to its current name is allowed', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'Transport']);

    $this->actingAs($user)
        ->patchJson("/api/v1/categories/{$category->id}", ['name' => 'Transport'])
        ->assertOk();
});

test('a user can delete an unused category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->deleteJson("/api/v1/categories/{$category->id}")
        ->assertNoContent();

    expect(Category::find($category->id))->toBeNull();
});

test('a category in use cannot be deleted', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
    ]);

    $this->actingAs($user)
        ->deleteJson("/api/v1/categories/{$category->id}")
        ->assertStatus(409)
        ->assertJsonPath('message', 'Kategori masih dipakai oleh pengeluaran dan tidak bisa dihapus.');

    expect($category->fresh())->not->toBeNull();
});

test('a user cannot delete another user\'s category', function () {
    $owner = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $owner->id]);

    $intruder = User::factory()->create();

    $this->actingAs($intruder)
        ->deleteJson("/api/v1/categories/{$category->id}")
        ->assertForbidden();

    expect($category->fresh())->not->toBeNull();
});
