<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\Response;

/**
 * One response envelope for the whole API:
 * { success, message, data, meta? }
 */
trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'OK', int $status = Response::HTTP_OK, array $meta = []): JsonResponse
    {
        $payload = ['success' => true, 'message' => $message];

        if ($data instanceof ResourceCollection && $data->resource instanceof LengthAwarePaginator) {
            $paginator = $data->resource;
            $payload['data'] = $data->collection->map->resolve(request())->values()->all();
            $payload['meta'] = array_merge([
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ], $meta);

            return response()->json($payload, $status);
        }

        $payload['data'] = $data instanceof JsonResource ? $data->resolve(request()) : $data;

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    protected function created(mixed $data = null, string $message = 'Created successfully.'): JsonResponse
    {
        return $this->success($data, $message, Response::HTTP_CREATED);
    }

    protected function deleted(string $message = 'Deleted successfully.'): JsonResponse
    {
        return $this->success(null, $message);
    }

    public static function error(string $message, int $status, string $errorCode, array $errors = [], array $debug = []): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
        ];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        if ($debug !== []) {
            $payload['debug'] = $debug;
        }

        return response()->json($payload, $status);
    }
}
