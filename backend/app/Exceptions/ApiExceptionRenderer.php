<?php

namespace App\Exceptions;

use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Turns every exception raised under /api/* into the standard error envelope
 * with a message that is safe to show to end users.
 */
class ApiExceptionRenderer
{
    /** Friendly names for models in "X not found." messages. */
    private const MODEL_LABELS = [
        'ShopProduct' => 'Listing',
        'User' => 'Shop owner',
    ];

    public function __invoke(Throwable $e, Request $request): ?JsonResponse
    {
        if (! $this->shouldHandle($request)) {
            return null;
        }

        $response = match (true) {
            $e instanceof BusinessException => ApiResponse::error($e->getMessage(), $e->status(), $e->errorCode(), $e->errors()),

            $e instanceof ValidationException => ApiResponse::error(
                $this->firstValidationMessage($e),
                Response::HTTP_UNPROCESSABLE_ENTITY,
                'VALIDATION_FAILED',
                $e->errors(),
            ),

            $e instanceof AuthenticationException => ApiResponse::error(
                'Please log in to continue.', Response::HTTP_UNAUTHORIZED, 'UNAUTHENTICATED',
            ),

            $e instanceof AuthorizationException,
            $e instanceof AccessDeniedHttpException => ApiResponse::error(
                'You do not have permission to perform this action.', Response::HTTP_FORBIDDEN, 'FORBIDDEN',
            ),

            $e instanceof NotFoundHttpException => ApiResponse::error(
                $this->notFoundMessage($e), Response::HTTP_NOT_FOUND, 'NOT_FOUND',
            ),

            $e instanceof MethodNotAllowedHttpException => ApiResponse::error(
                'This action is not supported on this endpoint.', Response::HTTP_METHOD_NOT_ALLOWED, 'METHOD_NOT_ALLOWED',
            ),

            $e instanceof ThrottleRequestsException => ApiResponse::error(
                $this->throttleMessage($e), Response::HTTP_TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS',
            ),

            $e instanceof HttpExceptionInterface => ApiResponse::error(
                $e->getMessage() !== '' ? $e->getMessage() : (Response::$statusTexts[$e->getStatusCode()] ?? 'Request failed.'),
                $e->getStatusCode(),
                'HTTP_'.$e->getStatusCode(),
            ),

            default => ApiResponse::error(
                'Something went wrong on our side. Please try again.',
                Response::HTTP_INTERNAL_SERVER_ERROR,
                $e instanceof QueryException ? 'DATABASE_ERROR' : 'SERVER_ERROR',
                [],
                $this->debugInfo($e),
            ),
        };

        if ($e instanceof HttpExceptionInterface) {
            $response->withHeaders($e->getHeaders());
        }

        return $response;
    }

    private function shouldHandle(Request $request): bool
    {
        return $request->is('api/*') || $request->expectsJson();
    }

    private function firstValidationMessage(ValidationException $e): string
    {
        $first = collect($e->errors())->flatten()->first();

        return is_string($first) ? $first : 'Please check the form and try again.';
    }

    private function notFoundMessage(NotFoundHttpException $e): string
    {
        $previous = $e->getPrevious();

        if ($previous instanceof ModelNotFoundException) {
            $model = class_basename($previous->getModel());
            $label = self::MODEL_LABELS[$model] ?? Str::headline($model);

            return ucfirst(strtolower($label)).' not found.';
        }

        return 'The requested resource was not found.';
    }

    private function throttleMessage(ThrottleRequestsException $e): string
    {
        $retryAfter = $e->getHeaders()['Retry-After'] ?? null;

        return $retryAfter
            ? "Too many attempts. Please try again in {$retryAfter} seconds."
            : 'Too many attempts. Please slow down and try again.';
    }

    private function debugInfo(Throwable $e): array
    {
        if (! config('app.debug')) {
            return [];
        }

        return [
            'exception' => $e::class,
            'message' => $e->getMessage(),
            'file' => $e->getFile().':'.$e->getLine(),
            'trace' => collect($e->getTrace())->take(10)->map(
                fn (array $frame) => ($frame['file'] ?? '?').':'.($frame['line'] ?? '?')
            )->all(),
        ];
    }
}
