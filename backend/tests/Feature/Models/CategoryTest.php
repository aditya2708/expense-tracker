<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a user owns many categories', function () {
    $user = User::factory()->create();

    $first = Category::factory()->create(['user_id' => $user->id]);
    $second = Category::factory()->create(['user_id' => $user->id]);

    expect($user->categories)->toHaveCount(2)
        ->and($user->categories->contains($first))->toBeTrue()
        ->and($user->categories->contains($second))->toBeTrue()
        ->and($first->user->is($user))->toBeTrue();
});

test('a category has many expenses', function () {
    $category = Category::factory()->create();

    $expense = Expense::factory()->create([
        'user_id' => $category->user_id,
        'category_id' => $category->id,
    ]);

    expect($category->expenses)->toHaveCount(1)
        ->and($category->expenses->first()->is($expense))->toBeTrue();
});

test('category names are unique per user', function () {
    $user = User::factory()->create();
    Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']);

    expect(fn () => Category::factory()->create(['user_id' => $user->id, 'name' => 'Makan']))
        ->toThrow(QueryException::class);

    $otherUser = User::factory()->create();
    $sameNameForOtherUser = Category::factory()->create([
        'user_id' => $otherUser->id,
        'name' => 'Makan',
    ]);

    expect($sameNameForOtherUser->name)->toBe('Makan');
});

test('a category in use cannot be deleted', function () {
    $expense = Expense::factory()->create();

    expect(fn () => $expense->category->delete())
        ->toThrow(QueryException::class);
});
