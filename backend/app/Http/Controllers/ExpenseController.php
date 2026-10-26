<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexExpenseRequest;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexExpenseRequest $request): AnonymousResourceCollection
    {
        $query = $request->user()
            ->expenses()
            ->with('category')
            ->orderByDesc('occurred_on')
            ->orderByDesc('id');

        if ($month = $request->validated('month')) {
            $start = CarbonImmutable::createFromFormat('Y-m-d', "{$month}-01")->startOfMonth();

            $query->whereBetween('occurred_on', [
                $start->toDateString(),
                $start->endOfMonth()->toDateString(),
            ]);
        }

        if ($categoryId = $request->validated('category_id')) {
            $query->where('category_id', $categoryId);
        }

        return ExpenseResource::collection(
            $query->paginate(20)->withQueryString(),
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $expense = $request->user()
            ->expenses()
            ->create($request->validated());

        $expense->load('category');

        return (new ExpenseResource($expense))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense): ExpenseResource
    {
        Gate::authorize('view', $expense);

        $expense->load('category');

        return new ExpenseResource($expense);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateExpenseRequest $request, Expense $expense): ExpenseResource
    {
        Gate::authorize('update', $expense);

        $expense->update($request->validated());
        $expense->load('category');

        return new ExpenseResource($expense);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense): Response
    {
        Gate::authorize('delete', $expense);

        $expense->delete();

        return response()->noContent();
    }
}
