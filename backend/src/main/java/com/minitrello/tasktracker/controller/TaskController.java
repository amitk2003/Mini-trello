package com.minitrello.tasktracker.controller;

import com.minitrello.tasktracker.entity.Task;
import com.minitrello.tasktracker.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * TaskController - REST API Controller for Task CRUD operations.
 * Base URL: /api/tasks
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskService taskService;

    /**
     * GET /api/tasks - Retrieve all tasks, with optional status filter.
     *
     * @param status optional query param to filter tasks by status
     * @return list of tasks wrapped in ResponseEntity
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(
            @RequestParam(required = false) Task.TaskStatus status) {
        List<Task> tasks = taskService.getAllTasks(status);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/{id} - Retrieve a task by its ID.
     *
     * @param id the task ID
     * @return the task wrapped in ResponseEntity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    /**
     * POST /api/tasks - Create a new task.
     *
     * @param task the task body from request (validated)
     * @return the created task with HTTP 201 status
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        Task created = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/tasks/{id} - Update an existing task.
     *
     * @param id          the task ID
     * @param taskDetails the updated task body (validated)
     * @return the updated task
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody Task taskDetails) {
        Task updated = taskService.updateTask(id, taskDetails);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/tasks/{id} - Delete a task by ID.
     *
     * @param id the task ID
     * @return a success message with HTTP 200
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of(
                "message", "Task deleted successfully",
                "taskId", id.toString(),
                "deletedAt", LocalDateTime.now().toString()
        ));
    }

    /**
     * GET /api/tasks/search?keyword=... - Search tasks by title keyword.
     *
     * @param keyword the search term
     * @return list of matching tasks
     */
    @GetMapping("/search")
    public ResponseEntity<List<Task>> searchTasks(@RequestParam String keyword) {
        List<Task> tasks = taskService.searchTasks(keyword);
        return ResponseEntity.ok(tasks);
    }
}
