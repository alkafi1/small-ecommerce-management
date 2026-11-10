<?php

namespace App\Services;

use App\Exceptions\AccountInactiveException;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    /**
     * @return array{token: string, user: User}
     */
    public function login(string $email, string $password, string $deviceName = 'web'): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new InvalidCredentialsException;
        }

        if (! $user->is_active) {
            throw new AccountInactiveException;
        }

        $token = $user->createToken($deviceName, [$user->role->value])->plainTextToken;

        return ['token' => $token, 'user' => $user];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
