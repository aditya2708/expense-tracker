<?php

namespace App\Http\Controllers;

use App\Http\Requests\MonthlyReportRequest;
use App\Http\Resources\MonthlyReportResource;
use Carbon\CarbonImmutable;

class MonthlyReportController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(MonthlyReportRequest $request): MonthlyReportResource
    {
        $month = $request->validated('month');
        $start = CarbonImmutable::createFromFormat('Y-m-d', "{$month}-01")->startOfMonth();

        $rows = $request->user()
            ->expenses()
            ->join('categories', 'categories.id', '=', 'expenses.category_id')
            ->whereBetween('expenses.occurred_on', [
                $start->toDateString(),
                $start->endOfMonth()->toDateString(),
            ])
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->orderBy('categories.name')
            ->selectRaw('categories.id as id, categories.name as name, SUM(expenses.amount) as total, COUNT(*) as expense_count')
            ->get();

        $total = (int) $rows->sum('total');

        $previousStart = $start->subMonthNoOverflow()->startOfMonth();
        $previousTotal = (int) $request->user()
            ->expenses()
            ->whereBetween('occurred_on', [
                $previousStart->toDateString(),
                $previousStart->endOfMonth()->toDateString(),
            ])
            ->sum('amount');

        $changePercentage = $previousTotal > 0
            ? round((($total - $previousTotal) / $previousTotal) * 100, 2)
            : null;

        $categories = $rows->map(fn (object $row): array => [
            'id' => (int) $row->id,
            'name' => $row->name,
            'total' => (int) $row->total,
            'count' => (int) $row->expense_count,
            'share' => $total > 0 ? round(((int) $row->total / $total) * 100, 2) : 0,
        ])->all();

        return new MonthlyReportResource([
            'month' => $month,
            'total' => $total,
            'expense_count' => (int) $rows->sum('expense_count'),
            'categories' => $categories,
            'previous_month' => [
                'month' => $previousStart->format('Y-m'),
                'total' => $previousTotal,
            ],
            'change_percentage' => $changePercentage,
        ]);
    }
}
