package com.minitrello.tasktracker.service;

import com.minitrello.tasktracker.entity.Task;
import com.minitrello.tasktracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * TaskService - Business logic layer for task management operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Retrieve all tasks, optionally filtered by status.
     *
     * @param status optional status filter; null returns all tasks
     * @return list of tasks
     */
    @Transactional(readOnly = true)
    public List<Task> getAllTasks(Task.TaskStatus status) {
        if (status != null) {
            log.debug("Fetching tasks with status: {}", status);
            return taskRepository.findByStatus(status);
        }
        log.debug("Fetching all tasks");
        return taskRepository.findAll();
    }

    /**
     * Retrieve a single task by its ID.
     *
     * @param id the task ID
     * @return the found task
     * @throws ResourceNotFoundException if no task found with the given ID
     */
    @Transactional(readOnly = true)
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    /**
     * Create a new task and persist it to the database.
     *
     * @param task the task to create
     * @return the saved task
     */
    @Transactional
    public Task createTask(Task task) {
        log.info("Creating task: {}", task.getTitle());
        task.setId(null); // Ensure no accidental overwrite
        return taskRepository.save(task);
    }

    /**
     * Update an existing task identified by its ID.
     *
     * @param id          the ID of the task to update
     * @param taskDetails the updated task details
     * @return the updated task
     * @throws ResourceNotFoundException if no task found with the given ID
     */
    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        Task existingTask = getTaskById(id);

        existingTask.setTitle(taskDetails.getTitle());
        existingTask.setDescription(taskDetails.getDescription());
        existingTask.setStatus(taskDetails.getStatus());
        existingTask.setDueDate(taskDetails.getDueDate());

        log.info("Updated task with id: {}", id);
        return taskRepository.save(existingTask);
    }

    /**
     * Delete a task by its ID.
     *
     * @param id the ID of the task to delete
     * @throws ResourceNotFoundException if no task found with the given ID
     */
    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
        log.info("Deleted task with id: {}", id);
    }

    /**
     * Search tasks by title keyword (case-insensitive).
     *
     * @param keyword the keyword to search for
     * @return list of matching tasks
     */
    @Transactional(readOnly = true)
    public List<Task> searchTasks(String keyword) {
        log.debug("Searching tasks with keyword: {}", keyword);
        return taskRepository.findByTitleContainingIgnoreCase(keyword);
    }
}
