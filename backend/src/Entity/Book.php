<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model;
use App\Controller\BookSearchController;
use App\Repository\BookRepository;
use App\State\Processor\BookPersistProcessor;
use App\State\Provider\BooksProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use Vich\UploaderBundle\Mapping\Annotation as Vich;

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
        new Post(
            inputFormats: ['multipart' => ['multipart/form-data']],
            openapi: new Model\Operation(
                requestBody: new Model\RequestBody(
                    content: new \ArrayObject([
                        'multipart/form-data' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'file' => [
                                        'type' => 'string',
                                        'format' => 'binary'
                                    ],
                                    'title' => [
                                        'type' => 'string'
                                    ],
                                    'author' => [
                                        'type' => 'string'
                                    ],
                                    'description' => [
                                        'type' => 'string'
                                    ],
                                    'rating' => [
                                        'type' => 'integer'
                                    ]
                                ]
                            ]
                        ]
                    ])
                )
            ),
            deserialize: false,
            processor: BookPersistProcessor::class
        ),
        new Get(
            security: 'object.getOwner() == user'
        ),
        new Patch(
            denormalizationContext: ['groups' => ['book:update']],
            security: 'object.getOwner() == user',
        ),
        new Delete(
            security: 'object.getOwner() == user'
        ),
        new GetCollection(
            provider: BooksProvider::class
        ),
    ],
    normalizationContext: ['groups' => ['book:read']],
    denormalizationContext: ['groups' => ['book:create', 'book:update']],
)]
#[ApiFilter(OrderFilter::class, properties: ['id', 'createdAt', 'title'])]
#[Vich\Uploadable]
#[ORM\Entity(repositoryClass: BookRepository::class)]
class Book
{
    #[Groups(['book:read'])]
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[Groups(['book:read', 'book:create', 'book:search', 'book:update'])]
    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[Groups(['book:read', 'book:create', 'book:search', 'book:update'])]
    #[ORM\Column(length: 255)]
    private ?string $author = null;

    #[Groups(['book:read', 'book:create', 'book:update'])]
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[Groups(['book:read', 'book:create', 'book:update'])]
    #[ORM\Column(nullable: true)]
    private ?int $rating = null;

    #[Groups(['book:create'])]
    #[Vich\UploadableField(mapping: 'books', fileNameProperty: 'filePath')]
    private ?File $file = null;

    #[Groups(['book:read'])]
    #[ORM\Column(nullable: true)]
    private ?string $filePath = null;

    #[ORM\ManyToOne(inversedBy: 'books')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $owner = null;

    /**
     * @var Collection<int, Note>
     */
    #[Groups(['book:read'])]
    #[ORM\OneToMany(targetEntity: Note::class, mappedBy: 'book', orphanRemoval: true)]
    private Collection $notes;

    #[Groups(['book:read'])]
    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->notes = new ArrayCollection();
    }

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(?int $rating): static
    {
        $this->rating = $rating;

        return $this;
    }

    /**
     * @return Collection<int, Note>
     */
    public function getNotes(): Collection
    {
        return $this->notes;
    }

    public function addNote(Note $note): static
    {
        if (!$this->notes->contains($note)) {
            $this->notes->add($note);
            $note->setBook($this);
        }

        return $this;
    }

    public function removeNote(Note $note): static
    {
        if ($this->notes->removeElement($note)) {
            // set the owning side to null (unless already changed)
            if ($note->getBook() === $this) {
                $note->setBook(null);
            }
        }

        return $this;
    }

    public function setFile(?File $file = null): void
    {
        $this->file = $file;

        if (null !== $file) {
            // It is required that at least one field changes if you are using doctrine
            // otherwise the event listeners won't be called and the file is lost
            $this->createdAt = new \DateTimeImmutable();
        }
    }

    public function getFile(): ?File
    {
        return $this->file;
    }

    public function setFilePath(?string $filePath): void
    {
        $this->filePath = $filePath;
    }

    public function getFilePath(): ?string
    {
        return $this->filePath;
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
}
