<?php

namespace App\Http\Requests\Owner;

use Illuminate\Foundation\Http\FormRequest;

class VisibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['is_visible' => ['required', 'boolean']];
    }

    public function messages(): array
    {
        return ['is_visible.required' => 'Please choose shown or hidden.'];
    }
}
