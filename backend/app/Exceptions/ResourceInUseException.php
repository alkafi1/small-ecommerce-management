<?php

namespace App\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class ResourceInUseException extends BusinessException
{
    public function __construct(string $message = 'This record is in use and cannot be deleted.')
    {
        parent::__construct($message, Response::HTTP_CONFLICT, 'RESOURCE_IN_USE');
    }
}
