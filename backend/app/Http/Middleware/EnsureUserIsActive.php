<?php

namespace App\Http\Middleware;

use App\Exceptions\AccountInactiveException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks tokens that belong to a deactivated account.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_active) {
            $user->currentAccessToken()?->delete();

            throw new AccountInactiveException;
        }

        return $next($request);
    }
}
