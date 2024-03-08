<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

class ResponseController {
    public function checkAuthentication(User|null $user, string $action = "create") {
        if (!$user) {
            return new JsonResponse(["error" => "You must be authenticated to ". $action ." a task"], 401, []);
        }
    }

    public function checkAuthor(User|null $user, Task $task, string $action) {
        if ($this->checkAuthentication($user)) {
           return $this->checkAuthentication($user, $action);
        }
        if($task->getAuthor() != $user) {
            return new JsonResponse(["error" => "You must be the owner of the task to ". $action ."it"], 401, []);
        }
    }
}