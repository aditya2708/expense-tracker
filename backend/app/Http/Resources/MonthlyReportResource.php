<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MonthlyReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'month' => $this->resource['month'],
            'total' => $this->resource['total'],
            'expense_count' => $this->resource['expense_count'],
            'categories' => $this->resource['categories'],
            'previous_month' => $this->resource['previous_month'],
            'change_percentage' => $this->resource['change_percentage'],
        ];
    }
}
