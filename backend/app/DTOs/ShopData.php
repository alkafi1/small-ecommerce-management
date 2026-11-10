<?php

namespace App\DTOs;

use Illuminate\Http\UploadedFile;

final readonly class ShopData
{
    public function __construct(
        public int $ownerId,
        public string $name,
        public ?string $description,
        public bool $isActive,
        public ?UploadedFile $logo = null,
        public bool $removeLogo = false,
    ) {}

    public function toArray(): array
    {
        return [
            'owner_id' => $this->ownerId,
            'name' => $this->name,
            'description' => $this->description,
            'is_active' => $this->isActive,
        ];
    }
}
