package com.minitrello.tasktracker.repository;

import com.minitrello.tasktracker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Task Repository - provides JPA CRUD operations and custom query methods.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks filtered by status.
     *
     * @param status the task status to filter on
     * @return list of tasks with the given status
     */
    List<Task> findByStatus(Task.TaskStatus status);

    /**
     * Find tasks whose title contains the given string (case-insensitive).
     *
     * @param title the search term
     * @return list of matching tasks
     */
    List<Task> findByTitleContainingIgnoreCase(String title);
}
