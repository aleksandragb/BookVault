<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class BookSearchController extends AbstractController
{
    public function __construct(
        private readonly HttpClientInterface $client
    )
    {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $search = $request->query->get('q');

        if (strlen($search) < 2) {
            return new JsonResponse(['error' => 'Query too short'], 400);
        }

        $response = $this->client->request(
            'GET',
            'https://www.googleapis.com/books/v1/volumes?q=' . urlencode($search) . '&langRestrict=pl'
        );

        $items = $response->toArray()['items'] ?? [];

        return new JsonResponse(array_map(function ($item) {
            $info = $item['volumeInfo'] ?? [];
            return [
                'id' => $item['id'] ?? null,
                'title' => $info['title'] ?? null,
                'author' => $info['authors'][0] ?? null,
            ];
        }, $items));
    }
}