<?php

namespace App\Http\Requests\Shared;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates common list query parameters so repositories only receive clean filters.
 */
class IndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'string', 'in:newest,name,-name,price,-price,email'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'is_visible' => ['nullable', 'boolean'],
            'owner_id' => ['nullable', 'integer'],
            'created_by' => ['nullable', 'integer'],
            'shop_id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'sort.in' => 'Unknown sort option.',
            'per_page.max' => 'You can load at most 100 items per page.',
        ];
    }

    /** Only the filters that were actually sent. */
    public function filters(): array
    {
        return array_filter($this->validated(), fn ($value) => $value !== null && $value !== '');
    }
}
