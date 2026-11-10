<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Stores images on the public disk and cleans up files that are replaced or removed.
 */
class ImageUploadService
{
    private const DISK = 'public';

    public function store(UploadedFile $file, string $directory): string
    {
        $name = Str::uuid()->toString().'.'.strtolower($file->extension() ?: 'jpg');

        return $file->storeAs($directory, $name, self::DISK);
    }

    /**
     * Stores the new file and schedules the old one for deletion once the
     * surrounding transaction commits (so a rollback never loses the old image).
     */
    public function replace(?UploadedFile $file, ?string $oldPath, string $directory): ?string
    {
        if (! $file) {
            return $oldPath;
        }

        $newPath = $this->store($file, $directory);
        $this->deleteAfterCommit($oldPath);

        return $newPath;
    }

    public function deleteAfterCommit(?string $path): void
    {
        if (! $path) {
            return;
        }

        DB::afterCommit(fn () => $this->delete($path));
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Str::startsWith($path, ['http://', 'https://'])
            ? $path
            : Storage::disk(self::DISK)->url($path);
    }
}
