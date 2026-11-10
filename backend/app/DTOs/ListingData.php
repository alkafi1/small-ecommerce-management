<?php

namespace App\DTOs;

use Illuminate\Http\UploadedFile;

/**
 * Shop-specific values for a listing. Null overrides mean "use the catalog value".
 */
final readonly class ListingData
{
    public function __construct(
        public string $price,
        public ?string $name,
        public ?string $description,
        public bool $isVisible,
        public ?int $productId = null,
        public ?UploadedFile $thumbnail = null,
        public bool $removeThumbnail = false,
    ) {}

    public function toArray(): array
    {
        return [
            'price' => $this->price,
            'name' => $this->name,
            'description' => $this->description,
            'is_visible' => $this->isVisible,
        ];
    }
}
