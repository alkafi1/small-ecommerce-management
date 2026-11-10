<?php

namespace App\Http\Requests\Admin;

use App\DTOs\ShopOwnerData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Create (POST) and update (PUT) a shop owner account. Password is optional on update.
 */
class ShopOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $owner = $this->route('shop_owner');
        $isCreate = $this->isMethod('post');

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($owner?->id)],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{6,30}$/'],
            'password' => [$isCreate ? 'required' : 'nullable', 'string', Password::min(8), 'confirmed'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'An account with this email already exists.',
            'phone.regex' => 'Please enter a valid phone number.',
            'password.required' => 'Please set a password for the new account.',
            'password.confirmed' => 'The two passwords do not match.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => strtolower(trim((string) $this->input('email')))]);
    }

    public function toDto(): ShopOwnerData
    {
        return new ShopOwnerData(
            name: $this->string('name')->trim()->toString(),
            email: $this->input('email'),
            phone: $this->filled('phone') ? $this->string('phone')->trim()->toString() : null,
            password: $this->filled('password') ? $this->input('password') : null,
            isActive: $this->boolean('is_active', true),
        );
    }
}
