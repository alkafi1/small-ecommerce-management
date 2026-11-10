<?php

namespace App\DTOs;

final readonly class ShopOwnerData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $phone,
        public ?string $password,
        public bool $isActive,
    ) {}

    /** Attributes for the users table. Password is left out when not given (update without change). */
    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'password' => $this->password,
            'is_active' => $this->isActive,
        ], fn ($value, $key) => $key !== 'password' || $value !== null, ARRAY_FILTER_USE_BOTH);
    }
}
