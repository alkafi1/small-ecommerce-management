<?php

namespace App\Http\Requests\Admin;

use App\DTOs\ShopData;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'owner_id' => [
                'required', 'integer',
                Rule::exists('users', 'id')
                    ->where('role', UserRole::ShopOwner->value)
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return ['owner_id' => 'shop owner'];
    }

    public function messages(): array
    {
        return [
            'owner_id.required' => 'Please choose a shop owner.',
            'owner_id.exists' => 'Please choose an active shop owner.',
            'logo.image' => 'The logo must be an image.',
            'logo.mimes' => 'The logo must be a JPG, PNG or WEBP file.',
            'logo.max' => 'The logo must not be larger than 2 MB.',
        ];
    }

    public function toDto(): ShopData
    {
        return new ShopData(
            ownerId: $this->integer('owner_id'),
            name: $this->string('name')->trim()->toString(),
            description: $this->input('description'),
            isActive: $this->boolean('is_active', true),
            logo: $this->file('logo'),
            removeLogo: $this->boolean('remove_logo'),
        );
    }
}
