<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a guest cannot list expenses', function () {
    $this->getJson('/api/v1/expenses')->assertUnauthorized();
});

test('a user only sees their own expenses, newest first', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $category = Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']);
    $otherCategory = Category::factory()->create(['user_id' => $otherUser->id]);

    $older = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'occurred_on' => '2026-10-01',
    ]);
    $newer = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'occurred_on' => '2026-10-05',
    ]);
    Expense::factory()->create([
        'user_id' => $otherUser->id,
        'category_id' => $otherCategory->id,
        'occurred_on' => '2026-10-03',
    ]);

    $this->actingAs($user)
        ->getJson('/api/v1/expenses')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $newer->id)
        ->assertJsonPath('data.0.category.name', 'Makan')
        ->assertJsonPath('data.1.id', $older->id);
});

test('expenses can be filtered by month', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    $october = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'occurred_on' => '2026-10-15',
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'occurred_on' => '2026-09-30',
    ]);

    $this->actingAs($user)
        ->getJson('/api/v1/expenses?month=2026-10')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $october->id);

    $this->actingAs($user)
        ->getJson('/api/v1/expenses?month=2026-13')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('month');
});

test('expenses can be filtered by category', function () {
    $user = User::factory()->create();
    $food = Category::factory()->create(['user_id' => $user->id]);
    $transport = Category::factory()->create(['user_id' => $user->id]);

    $meal = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $food->id,
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $transport->id,
    ]);

    $this->actingAs($user)
        ->getJson("/api/v1/expenses?category_id={$food->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $meal->id);
});

test('the expense list is paginated', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Expense::factory()->count(25)->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
    ]);

    $this->actingAs($user)
        ->getJson('/api/v1/expenses')
        ->assertOk()
        ->assertJsonCount(20, 'data')
        ->assertJsonPath('meta.total', 25)
        ->assertJsonPath('meta.per_page', 20);
});

test('a user can record an expense', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->postJson('/api/v1/expenses', [
            'category_id' => $category->id,
            'amount' => 25000,
            'occurred_on' => '2026-10-05',
            'note' => 'Makan siang',
        ])
        ->assertCreated()
        ->assertJsonPath('data.amount', 25000)
        ->assertJsonPath('data.occurred_on', '2026-10-05')
        ->assertJsonPath('data.note', 'Makan siang')
        ->assertJsonPath('data.category.id', $category->id);

    $expense = $user->expenses()->sole();

    expect($expense->category_id)->toBe($category->id)
        ->and($expense->amount)->toBe(25000)
        ->and($expense->occurred_on->toDateString())->toBe('2026-10-05');
});

test('an expense cannot use a category owned by another user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $otherCategory = Category::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->postJson('/api/v1/expenses', [
            'category_id' => $otherCategory->id,
            'amount' => 25000,
            'occurred_on' => '2026-10-05',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('category_id');

    $this->assertDatabaseCount('expenses', 0);
});

test('amount and date are validated when recording an expense', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->postJson('/api/v1/expenses', [
            'category_id' => $category->id,
            'amount' => 0,
            'occurred_on' => '05-10-2026',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['amount', 'occurred_on']);
});

test('a guest cannot record an expense', function () {
    $this->postJson('/api/v1/expenses', [])->assertUnauthorized();
});

test('a user can view their expense', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);
    $expense = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 30000,
        'occurred_on' => '2026-10-04',
    ]);

    $this->actingAs($user)
        ->getJson("/api/v1/expenses/{$expense->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $expense->id)
        ->assertJsonPath('data.amount', 30000)
        ->assertJsonPath('data.category.id', $category->id);
});

test('a user cannot view another user\'s expense', function () {
    $owner = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $owner->id]);

    $intruder = User::factory()->create();

    $this->actingAs($intruder)
        ->getJson("/api/v1/expenses/{$expense->id}")
        ->assertForbidden();
});

test('a user can update their expense', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);
    $expense = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 30000,
        'occurred_on' => '2026-10-04',
    ]);

    $this->actingAs($user)
        ->patchJson("/api/v1/expenses/{$expense->id}", [
            'category_id' => $category->id,
            'amount' => 35000,
            'occurred_on' => '2026-10-06',
            'note' => 'Diperbarui',
        ])
        ->assertOk()
        ->assertJsonPath('data.amount', 35000)
        ->assertJsonPath('data.occurred_on', '2026-10-06')
        ->assertJsonPath('data.note', 'Diperbarui');

    expect($expense->refresh()->amount)->toBe(35000);
});

test('an expense update cannot use another user\'s category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);
    $expense = Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
    ]);

    $otherUser = User::factory()->create();
    $otherCategory = Category::factory()->create(['user_id' => $otherUser->id]);

    $this->actingAs($user)
        ->patchJson("/api/v1/expenses/{$expense->id}", [
            'category_id' => $otherCategory->id,
            'amount' => 35000,
            'occurred_on' => '2026-10-06',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('category_id');
});

test('a user can delete their expense', function () {
    $user = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->deleteJson("/api/v1/expenses/{$expense->id}")
        ->assertNoContent();

    expect(Expense::find($expense->id))->toBeNull();
});

test('a user cannot delete another user\'s expense', function () {
    $owner = User::factory()->create();
    $expense = Expense::factory()->create(['user_id' => $owner->id]);

    $intruder = User::factory()->create();

    $this->actingAs($intruder)
        ->deleteJson("/api/v1/expenses/{$expense->id}")
        ->assertForbidden();

    expect($expense->fresh())->not->toBeNull();
});
