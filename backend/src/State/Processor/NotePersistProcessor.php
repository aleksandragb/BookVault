<?php

namespace App\State\Processor;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Note;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

final readonly class NotePersistProcessor implements ProcessorInterface
{
    public function __construct(
        private Security         $security,
        private PersistProcessor $processor
    )
    {
    }

    /**
     * @param Note $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Note
    {
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new UnauthorizedHttpException("Invalid user type.");
        }

        $data->setCreatedAt(new \DateTimeImmutable());

        return $this->processor->process($data, $operation, $uriVariables, $context);
    }
}