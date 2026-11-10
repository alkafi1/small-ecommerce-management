<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case ShopOwner = 'shop_owner';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::ShopOwner => 'Shop owner',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
