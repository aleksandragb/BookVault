<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Repository\BookRepository;
use Symfony\Bundle\SecurityBundle\Security;

readonly class BooksProvider implements ProviderInterface
{
    public function __construct(
        private BookRepository $repository,
        private Security       $security)
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array|null|object
    {
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            return null;
        }

        $orderBy = [];
        if (isset($context['filters']['order'])) {
            foreach ($context['filters']['order'] as $field => $direction) {
                if (in_array($field, ['title', 'createdAt', 'id'])) {
                    $orderBy[$field] = strtoupper($direction) === 'DESC' ? 'DESC' : 'ASC';
                }
            }
        }

        return $this->repository->findBy(['owner' => $currentUser], $orderBy);
    }
}