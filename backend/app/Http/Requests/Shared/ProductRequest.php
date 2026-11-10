<?php

namespace App\Http\Requests\Shared;

use App\DTOs\ProductData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Catalog product form, used by both admins and shop owners.
 */
class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:160'],
            'sku' => ['nullable', 'string', 'max:64', 'regex:/^[A-Za-z0-9\-_.]+$/', Rule::unique('products', 'sku')->ignore($this->route('product')?->id)],
            'description' => ['nullable', 'string', 'max:5000'],
            'base_price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_thumbnail' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['base_price' => 'price', 'sku' => 'SKU'];
    }

    public function messages(): array
    {
        return [
            'sku.unique' => 'Another product already uses this SKU.',
            'sku.regex' => 'SKU may only contain letters, numbers, dashes, dots and underscores.',
            'base_price.decimal' => 'Price can have at most 2 decimal places.',
            'thumbnail.image' => 'The thumbnail must be an image.',
            'thumbnail.mimes' => 'The thumbnail must be a JPG, PNG or WEBP file.',
            'thumbnail.max' => 'The thumbnail must not be larger than 2 MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('sku')) {
            $this->merge(['sku' => strtoupper(trim((string) $this->input('sku')))]);
        }
    }

    public function toDto(): ProductData
    {
        return new ProductData(
            name: $this->string('name')->trim()->toString(),
            sku: $this->filled('sku') ? $this->input('sku') : null,
            description: $this->input('description'),
            basePrice: number_format((float) $this->input('base_price'), 2, '.', ''),
            isActive: $this->boolean('is_active', true),
            thumbnail: $this->file('thumbnail'),
            removeThumbnail: $this->boolean('remove_thumbnail'),
        );
    }
}
