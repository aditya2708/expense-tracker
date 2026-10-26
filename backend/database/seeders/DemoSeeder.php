<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public const string EMAIL = 'demo@expense-tracker.test';

    public const string NAME = 'Demo User';

    /**
     * @var list<array{int, string, int}>
     */
    private const array EXPENSES = [
        [0, 'Makan', 45000],
        [0, 'Transport', 18000],
        [1, 'Makan', 32000],
        [2, 'Belanja', 120000],
        [3, 'Makan', 40000],
        [4, 'Transport', 25000],
        [5, 'Tagihan', 350000],
        [7, 'Makan', 55000],
        [8, 'Kesehatan', 75000],
        [10, 'Belanja', 90000],
        [12, 'Makan', 38000],
        [14, 'Transport', 22000],
        [16, 'Lainnya', 60000],
        [18, 'Makan', 42000],
        [20, 'Tagihan', 200000],
        [23, 'Belanja', 150000],
        [25, 'Makan', 36000],
        [28, 'Transport', 20000],
        [30, 'Kesehatan', 120000],
        [33, 'Makan', 48000],
        [36, 'Lainnya', 45000],
        [40, 'Belanja', 110000],
        [44, 'Makan', 52000],
        [48, 'Transport', 24000],
        [52, 'Tagihan', 300000],
        [58, 'Makan', 39000],
        [65, 'Belanja', 95000],
        [72, 'Kesehatan', 80000],
        [75, 'Makan', 41000],
        [80, 'Transport', 21000],
    ];

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->reset();
    }

    public function reset(): User
    {
        return DB::transaction(function (): User {
            $user = User::firstOrCreate(
                ['email' => self::EMAIL],
                ['name' => self::NAME, 'password' => Str::password(32)],
            );

            $user->forceFill([
                'name' => self::NAME,
                'password' => Str::password(32),
            ])->save();

            $user->expenses()->delete();
            $user->categories()->delete();

            $this->seedDataset($user);

            return $user;
        });
    }

    private function seedDataset(User $user): void
    {
        $categories = collect(Category::DEFAULT_NAMES)
            ->mapWithKeys(fn (string $name): array => [
                $name => $user->categories()->create(['name' => $name])->id,
            ]);

        $today = CarbonImmutable::now('Asia/Jakarta')->startOfDay();

        foreach (self::EXPENSES as [$daysAgo, $categoryName, $amount]) {
            $user->expenses()->create([
                'category_id' => $categories[$categoryName],
                'amount' => $amount,
                'occurred_on' => $today->subDays($daysAgo)->toDateString(),
            ]);
        }
    }
}
