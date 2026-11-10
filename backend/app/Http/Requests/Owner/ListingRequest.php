<?php

namespace App\Http\Requests\Owner;

use App\DTOs\ListingData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Add a catalog product to a shop (POST) or change a listing (PUT).
 * Empty name/description mean "use the catalog value".
 */
class ListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $shop = $this->route('shop');

        $rules = [
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
            'name' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:5000'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_thumbnail' => ['sometimes', 'boolean'],
            'is_visible' => ['sometimes', 'boolean'],
        ];

        if ($this->isMethod('post')) {
            $rules['product_id'] = [
                'required', 'integer',
                Rule::exists('products', 'id')->where('is_active', true)->whereNull('deleted_at'),
                Rule::unique('shop_products', 'product_id')->where('shop_id', $shop?->id),
            ];
        }

        return $rules;
    }

    public function attributes(): array
    {
        return ['product_id' => 'product'];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Please choose a product from the catalog.',
            'product_id.exists' => 'This product is not available in the catalog.',
            'product_id.unique' => 'This product is already listed in this shop.',
            'price.required' => 'Please set a price for your shop.',
            'price.min' => 'Price must be greater than 0.',
            'price.decimal' => 'Price can have at most 2 decimal places.',
            'thumbnail.image' => 'The thumbnail must be an image.',
            'thumbnail.mimes' => 'The thumbnail must be a JPG, PNG or WEBP file.',
            'thumbnail.max' => 'The thumbnail must not be larger than 2 MB.',
        ];
    }

    public function toDto(): ListingData
    {
        return new ListingData(
            price: number_format((float) $this->input('price'), 2, '.', ''),
            name: $this->filled('name') ? $this->string('name')->trim()->toString() : null,
            description: $this->filled('description') ? $this->input('description') : null,
            isVisible: $this->boolean('is_visible', true),
            productId: $this->isMethod('post') ? $this->integer('product_id') : null,
            thumbnail: $this->file('thumbnail'),
            removeThumbnail: $this->boolean('remove_thumbnail'),
        );
    }
}
