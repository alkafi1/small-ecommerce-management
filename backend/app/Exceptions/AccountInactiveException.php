<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class AccountInactiveException extends BusinessException
{
    public function __construct(string $message = 'Your account is disabled. Please contact the administrator.')
    {
        parent::__construct($message, Response::HTTP_FORBIDDEN, 'ACCOUNT_INACTIVE');
    }
}
