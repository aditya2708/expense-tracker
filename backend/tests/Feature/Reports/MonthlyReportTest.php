<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a guest cannot view the monthly report', function () {
    $this->getJson('/api/v1/reports/monthly?month=2026-10')->assertUnauthorized();
});

test('a user sees their monthly totals broken down by category', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $food = Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']);
    $transport = Category::factory()->create(['user_id' => $user->id, 'name' => 'Transport']);
    $otherCategory = Category::factory()->create(['user_id' => $otherUser->id]);

    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $food->id,
        'amount' => 25000,
        'occurred_on' => '2026-10-03',
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $food->id,
        'amount' => 35000,
        'occurred_on' => '2026-10-20',
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $transport->id,
        'amount' => 30000,
        'occurred_on' => '2026-10-10',
    ]);
    Expense::factory()->create([
        'user_id' => $otherUser->id,
        'category_id' => $otherCategory->id,
        'amount' => 999000,
        'occurred_on' => '2026-10-10',
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $food->id,
        'amount' => 500000,
        'occurred_on' => '2026-09-30',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly?month=2026-10');

    $response->assertOk()
        ->assertJsonPath('data.month', '2026-10')
        ->assertJsonPath('data.total', 90000)
        ->assertJsonPath('data.expense_count', 3)
        ->assertJsonCount(2, 'data.categories')
        ->assertJsonPath('data.categories.0.id', $food->id)
        ->assertJsonPath('data.categories.0.name', 'Makan')
        ->assertJsonPath('data.categories.0.total', 60000)
        ->assertJsonPath('data.categories.0.count', 2)
        ->assertJsonPath('data.categories.1.name', 'Transport')
        ->assertJsonPath('data.categories.1.total', 30000);

    expect($response->json('data.categories.0.share'))->toEqual(66.67)
        ->and($response->json('data.categories.1.share'))->toEqual(33.33);
});

test('the report compares against the previous month', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 90000,
        'occurred_on' => '2026-10-05',
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 75000,
        'occurred_on' => '2026-09-15',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly?month=2026-10');

    $response->assertOk()
        ->assertJsonPath('data.previous_month.month', '2026-09')
        ->assertJsonPath('data.previous_month.total', 75000);

    expect($response->json('data.change_percentage'))->toEqual(20.0);
});

test('change is null when the previous month has no expenses', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 90000,
        'occurred_on' => '2026-10-05',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly?month=2026-10');

    $response->assertOk()
        ->assertJsonPath('data.previous_month.month', '2026-09')
        ->assertJsonPath('data.previous_month.total', 0);

    expect($response->json('data.change_percentage'))->toBeNull();
});

test('a month without expenses returns an empty report', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly?month=2026-10')
        ->assertOk()
        ->assertJsonPath('data.total', 0)
        ->assertJsonPath('data.expense_count', 0)
        ->assertJsonCount(0, 'data.categories')
        ->assertJsonPath('data.previous_month.total', 0)
        ->assertJsonPath('data.change_percentage', null);
});

test('january compares against december of the previous year', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $user->id]);

    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 10000,
        'occurred_on' => '2026-01-10',
    ]);
    Expense::factory()->create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 8000,
        'occurred_on' => '2025-12-20',
    ]);

    $response = $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly?month=2026-01');

    $response->assertOk()
        ->assertJsonPath('data.previous_month.month', '2025-12')
        ->assertJsonPath('data.previous_month.total', 8000);

    expect($response->json('data.change_percentage'))->toEqual(25.0);
});

test('the report month is required and must be valid', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('month');

    $this->actingAs($user)
        ->getJson('/api/v1/reports/monthly?month=2026-13')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('month');
});
