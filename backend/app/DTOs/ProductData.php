<?php

namespace App\DTOs;

use Illuminate\Http\UploadedFile;

final readonly class ProductData
{
    public function __construct(
        public string $name,
        public ?string $sku,
        public ?string $description,
        public string $basePrice,
        public bool $isActive,
        public ?UploadedFile $thumbnail = null,
        public bool $removeThumbnail = false,
    ) {}

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'sku' => $this->sku,
            'description' => $this->description,
            'base_price' => $this->basePrice,
            'is_active' => $this->isActive,
        ];
    }
}
