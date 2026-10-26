<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'month' => ['sometimes', 'nullable', 'date_format:Y-m'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ];
    }
}
