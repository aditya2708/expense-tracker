<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => fn (array $attributes): int => Category::factory()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'amount' => fake()->numberBetween(1_000, 500_000),
            'occurred_on' => fake()->dateTimeBetween('-3 months')->format('Y-m-d'),
            'note' => fake()->optional()->sentence(),
        ];
    }
}
