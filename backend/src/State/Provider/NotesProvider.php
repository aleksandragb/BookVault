<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Repository\NoteRepository;
use Symfony\Bundle\SecurityBundle\Security;

readonly class NotesProvider implements ProviderInterface
{
    public function __construct(
        private NoteRepository $repository,
        private Security       $security)
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array|null|object
    {
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            return null;
        }

        return $this->repository->findUserNotes($currentUser);
    }
}