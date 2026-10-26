<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('an expense belongs to a user and a category', function () {
    $expense = Expense::factory()->create([
        'amount' => 25000,
        'occurred_on' => '2026-10-05',
        'note' => 'Makan siang',
    ]);

    expect($expense->user)->toBeInstanceOf(User::class)
        ->and($expense->category)->toBeInstanceOf(Category::class)
        ->and($expense->category->user->is($expense->user))->toBeTrue()
        ->and($expense->user->expenses->contains($expense))->toBeTrue()
        ->and($expense->amount)->toBeInt()->toBe(25000)
        ->and($expense->occurred_on->toDateString())->toBe('2026-10-05')
        ->and($expense->note)->toBe('Makan siang');
});
