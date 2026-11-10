<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class InvalidCredentialsException extends BusinessException
{
    public function __construct(string $message = 'Email or password is incorrect.')
    {
        parent::__construct($message, Response::HTTP_UNAUTHORIZED, 'INVALID_CREDENTIALS', [
            'email' => [$message],
        ]);
    }
}
