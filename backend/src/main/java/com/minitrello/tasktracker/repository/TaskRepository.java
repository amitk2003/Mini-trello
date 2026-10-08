package com.minitrello.tasktracker.repository;

import com.minitrello.tasktracker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Task Repository - provides JPA CRUD operations and custom query methods.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find all tasks ordered by creation date descending.
     */
    List<Task> findAllByOrderByCreatedAtDesc();

    /**
     * Find all tasks filtered by status, newest first.
     */
    List<Task> findByStatusOrderByCreatedAtDesc(Task.TaskStatus status);

    /**
     * Find tasks whose title contains the given string (case-insensitive).
     */
    List<Task> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    /**
     * Find all tasks belonging to a specific board, newest first.
     */
    List<Task> findByBoardIdOrderByCreatedAtDesc(Long boardId);

    /**
     * Find tasks in a board filtered by status, newest first.
     */
    List<Task> findByBoardIdAndStatusOrderByCreatedAtDesc(Long boardId, Task.TaskStatus status);

    /**
     * Search tasks in a board by keyword.
     */
    List<Task> findByBoardIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(Long boardId, String title);

    /**
     * Count tasks by status.
     */
    long countByStatus(Task.TaskStatus status);

    /**
     * Count tasks by board and status.
     */
    long countByBoardIdAndStatus(Long boardId, Task.TaskStatus status);

    /**
     * Count total tasks in a board.
     */
    long countByBoardId(Long boardId);

    /**
     * Count overdue tasks across all boards (dueDate before now and not COMPLETED).
     */
    long countByDueDateBeforeAndStatusNot(LocalDateTime date, Task.TaskStatus status);

    /**
     * Count overdue tasks in a specific board.
     */
    long countByBoardIdAndDueDateBeforeAndStatusNot(Long boardId, LocalDateTime date, Task.TaskStatus status);

    /**
     * Delete all tasks associated with a specific board.
     */
    void deleteByBoardId(Long boardId);
}

