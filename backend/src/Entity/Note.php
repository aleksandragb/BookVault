<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\NoteRepository;
use App\State\Processor\NotePersistProcessor;
use App\State\Provider\NotesProvider;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: NoteRepository::class)]
#[ApiResource(
    operations: [
        new Post(
            securityPostDenormalize: 'object.getBook().getOwner() === user',
            processor: NotePersistProcessor::class
        ),
        new Patch(
            denormalizationContext: ['groups' => ['note:update']],
            security: 'object.getBook().getOwner() == user',
        ),
        new Delete(
            security: 'object.getBook().getOwner() == user'
        ),
        new GetCollection(
            provider: NotesProvider::class,
        ),
    ],
    normalizationContext: ['groups' => ['note:read']],
    denormalizationContext: ['groups' => ['note:create', 'note:update']],
)]
class Note
{
    #[Groups(['note:read', 'book:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['note:read', 'book:read'])]
    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[Groups(['note:read', 'note:create', 'note:update', 'book:read'])]
    #[ORM\Column(length: 255)]
    private ?string $content = null;

    #[ApiProperty(
        openapiContext: [
            'example' => '/api/books/1'
        ]
    )]
    #[Groups(['note:read', 'note:create'])]
    #[ORM\ManyToOne(inversedBy: 'notes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Book $book = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getBook(): ?Book
    {
        return $this->book;
    }

    public function setBook(?Book $book): static
    {
        $this->book = $book;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }
}
