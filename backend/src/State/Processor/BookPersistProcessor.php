<?php

namespace App\State\Processor;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Book;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

final readonly class BookPersistProcessor implements ProcessorInterface
{
    public function __construct(
        private Security         $security,
        private PersistProcessor $processor
    )
    {
    }

    /**
     * @param Book $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Book
    {
        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new UnauthorizedHttpException("Invalid user type.");
        }
        $request = $context['request'] ?? null;
        if (!$request) {
            throw new NotFoundHttpException();
        }

        $book = new Book();
        $book->setTitle($request->request->get('title'));
        $book->setAuthor($request->request->get('author'));
        $book->setDescription($request->request->get('description'));
        $book->setRating((int)$request->request->get('rating'));
        $book->setOwner($currentUser);
        $book->setFile($request->files->get('file'));

        return $this->processor->process($book, $operation, $uriVariables, $context);
    }
}