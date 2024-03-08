<?php

namespace App\Controller;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Encoder\XmlEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Serializer\Mapping\Factory\ClassMetadataFactory;
use Symfony\Component\Serializer\Mapping\Loader\AttributeLoader;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

#[Route('/task')]
class TaskController extends AbstractController
{
    private Serializer $serializer;

    public function __construct()
    {
        $encoders = [new XmlEncoder(), new JsonEncoder()];
        $classMetadataFactory = new ClassMetadataFactory(new AttributeLoader());
        $normalizers = [new ObjectNormalizer($classMetadataFactory)];

        $this->serializer = new Serializer($normalizers, $encoders);
    }

    #[Route('/', name: 'app_task_index', methods: ['GET'])]
    public function index(TaskRepository $taskRepository): JsonResponse
    {
        $tasks = $taskRepository->findAll();
        $jsonTasks = $this->serializer->serialize($tasks, "json", ["groups" => "getTask"]);
        return new JsonResponse($jsonTasks, 200, [], true);
    }

    #[Route('/new', name: 'app_task_new', methods: ['GET', 'POST'])]
    public function new(Request $request, EntityManagerInterface $entityManager, ResponseController $responseController): JsonResponse
    {
        $user = $this->getUser();
        if ($responseController->checkAuthentication($user)) {
            return $responseController->checkAuthentication($user);
        }

        $task = new Task();
        $task->setAuthor($user);

        $this->serializer->deserialize($request->getContent(), Task::class, 'json', [AbstractNormalizer::OBJECT_TO_POPULATE => $task]);

        $entityManager->persist($task);
        $entityManager->flush();

        $jsonTask = $this->serializer->serialize($task, "json", ["groups" => "getTask"]);

        return new JsonResponse($jsonTask, 201, []);
    }

    #[Route('/{id}', name: 'app_task_show', methods: ['GET'])]
    public function show(Task $task): Response
    {
        return $this->render('task/show.html.twig', [
            'task' => $task,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_task_edit', methods: ['PATCH'])]
    public function edit(Request $request, Task $task, EntityManagerInterface $entityManager, ResponseController $responseController): Response
    {
        $user = $this->getUser();

        if ($responseController->checkAuthor($user, $task, "edit")) {
            return $responseController->checkAuthor($user, $task, "edit");
        }
        $taskToEdit = new Task();
        $this->serializer->deserialize($request->getContent(), Task::class, 'json', [AbstractNormalizer::OBJECT_TO_POPULATE => $taskToEdit]);

        $task->setTitle($taskToEdit->getTitle());
        $task->setDescription($taskToEdit->getDescription());

        $entityManager->flush();
        $jsonTask = $this->serializer->serialize($task, "json", ["groups" => "getTask"]);
        return new JsonResponse($jsonTask, 200, []);
    }

    #[Route('/{id}/delete', name: 'app_task_delete', methods: ['DELETE'])]
    public function delete(Request $request, Task $task, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete_'. $task->getId(), $request->toArray()["token"])) {
            $entityManager->remove($task);
            $entityManager->flush();
        }
        return new JsonResponse([], 204, []);
    }

    #[Route(path: '/{id}/get-token', name: 'app_get_token', methods: ['GET'])]
    public function getToken(Task $task, CsrfTokenManagerInterface $csrfTokenManagerInterface, ResponseController $responseController) {
        $user = $this->getUser();
        if ($responseController->checkAuthor($user, $task, "delete")) {
            return $responseController->checkAuthor($user, $task, "delete");
        }
        
        $token = $csrfTokenManagerInterface->getToken('delete_'. $task->getId())->getValue();
        return new JsonResponse(["token" => $token], 200, []);
    }
}
