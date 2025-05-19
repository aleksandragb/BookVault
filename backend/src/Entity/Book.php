<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use App\Controller\BookSearchController;
use App\Repository\BookRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: BookRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/books/search',
            controller: BookSearchController::class,
            openapi: new Model\Operation(
                parameters: [
                    new Model\Parameter(
                        name: 'q',
                        in: 'query',
                        required: true,
                        schema: ['type' => 'string'],
                        example: 'Harry Potter',
                    )
                ]
            ),
            paginationEnabled: false,
            read: false,
            write: false,
        )
    ],
    normalizationContext: ['groups' => ['book:search']],
)]
#[ApiResource(
    operations: [
        new Post(),
        new Get(),
        new Patch(),
        new Delete(),

    ],
    normalizationContext: ['groups' => ['book:read']],
    denormalizationContext: ['groups' => ['book:create', 'book:update']],
)]
class Book
{
    #[Groups(['book:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['book:read', 'book:create', 'book:search'])]
    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[Groups(['book:read', 'book:create', 'book:search'])]
    #[ORM\Column(length: 255)]
    private ?string $author = null;

    #[ORM\ManyToOne(inversedBy: 'books')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getAuthor(): ?string
    {
        return $this->author;
    }

    public function setAuthor(string $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;

        return $this;
    }
}
