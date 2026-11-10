<?php

namespace App\Http\Requests\Shared;

use Illuminate\Foundation\Http\FormRequest;

class StatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }

    public function messages(): array
    {
        return ['is_active.required' => 'Please choose active or inactive.'];
    }

    public function isActive(): bool
    {
        return $this->boolean('is_active');
    }
}
