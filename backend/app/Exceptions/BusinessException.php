<?php

namespace App\Exceptions;

use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Base for expected, user-facing domain errors. The message is safe to show.
 */
class BusinessException extends RuntimeException
{
    public function __construct(
        string $message = 'The request could not be completed.',
        protected int $status = Response::HTTP_UNPROCESSABLE_ENTITY,
        protected string $errorCode = 'BUSINESS_RULE_VIOLATION',
        protected array $errors = [],
    ) {
        parent::__construct($message);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }

    public function errors(): array
    {
        return $this->errors;
    }
}
