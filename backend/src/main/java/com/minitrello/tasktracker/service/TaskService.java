package com.minitrello.tasktracker.service;

import com.minitrello.tasktracker.dto.TaskStatsDto;
import com.minitrello.tasktracker.entity.Board;
import com.minitrello.tasktracker.entity.Task;
import com.minitrello.tasktracker.repository.BoardRepository;
import com.minitrello.tasktracker.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * TaskService - Business logic layer for task management operations.
 */
@Service
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final BoardRepository boardRepository;
    private final ActivityLogService activityLogService;

    public TaskService(TaskRepository taskRepository, BoardRepository boardRepository, ActivityLogService activityLogService) {
        this.taskRepository = taskRepository;
        this.boardRepository = boardRepository;
        this.activityLogService = activityLogService;
    }

    /**
     * Retrieve tasks, optionally filtered by board and status, sorted newest first.
     *
     * @param boardId optional board ID filter
     * @param status  optional status filter; null returns all tasks
     * @return list of tasks
     */
    @Transactional(readOnly = true)
    public List<Task> getAllTasks(Long boardId, Task.TaskStatus status) {
        if (boardId != null) {
            if (status != null) {
                log.debug("Fetching tasks for board {} with status: {}", boardId, status);
                return taskRepository.findByBoardIdAndStatusOrderByCreatedAtDesc(boardId, status);
            }
            log.debug("Fetching tasks for board {}", boardId);
            return taskRepository.findByBoardIdOrderByCreatedAtDesc(boardId);
        }
        if (status != null) {
            log.debug("Fetching tasks with status: {}", status);
            return taskRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        log.debug("Fetching all tasks");
        return taskRepository.findAllByOrderByCreatedAtDesc();
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
     * If no board is provided, falls back to the first existing board or creates a default board.
     *
     * @param task the task to create
     * @return the saved task
     */
    @Transactional
    public Task createTask(Task task) {
        log.info("Creating task: {}", task.getTitle());
        task.setId(null); // Ensure no accidental overwrite

        // Resolve board
        Board board;
        if (task.getBoard() != null && task.getBoard().getId() != null) {
            board = boardRepository.findById(task.getBoard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Associated Board not found with id: " + task.getBoard().getId()));
        } else {
            // Fallback: pick the first available board or create a default one
            board = boardRepository.findAllByOrderByCreatedAtAsc().stream().findFirst().orElseGet(() -> {
                Board defaultBoard = new Board();
                defaultBoard.setName("📌 General Tasks");
                defaultBoard.setDescription("Default workspace board");
                return boardRepository.save(defaultBoard);
            });
        }
        task.setBoard(board);

        if (task.getPriority() == null) {
            task.setPriority(Task.TaskPriority.MEDIUM);
        }
        if (task.getStatus() == null) {
            task.setStatus(Task.TaskStatus.PENDING);
        }

        Task saved = taskRepository.save(task);

        // Audit log
        activityLogService.logActivity(
                board.getId(),
                saved.getId(),
                saved.getTitle(),
                "TASK_CREATED",
                "Task '" + saved.getTitle() + "' was created in board '" + board.getName() + "'"
        );

        return saved;
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
        String oldTitle = existingTask.getTitle();
        Task.TaskStatus oldStatus = existingTask.getStatus();
        Board oldBoard = existingTask.getBoard();

        existingTask.setTitle(taskDetails.getTitle());
        existingTask.setDescription(taskDetails.getDescription());
        if (taskDetails.getStatus() != null) {
            existingTask.setStatus(taskDetails.getStatus());
        }
        if (taskDetails.getPriority() != null) {
            existingTask.setPriority(taskDetails.getPriority());
        }
        existingTask.setDueDate(taskDetails.getDueDate());
        if (taskDetails.getTags() != null) {
            existingTask.setTags(taskDetails.getTags());
        }

        // Handle possible board relocation
        if (taskDetails.getBoard() != null && taskDetails.getBoard().getId() != null
                && !oldBoard.getId().equals(taskDetails.getBoard().getId())) {
            Board newBoard = boardRepository.findById(taskDetails.getBoard().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Board not found with id: " + taskDetails.getBoard().getId()));
            existingTask.setBoard(newBoard);

            activityLogService.logActivity(
                    newBoard.getId(),
                    id,
                    existingTask.getTitle(),
                    "TASK_MOVED",
                    "Task '" + existingTask.getTitle() + "' was moved from board '" + oldBoard.getName() + "' to '" + newBoard.getName() + "'"
            );
        }

        Task saved = taskRepository.save(existingTask);

        // Audit status transitions or updates
        if (oldStatus != saved.getStatus()) {
            activityLogService.logActivity(
                    saved.getBoard().getId(),
                    id,
                    saved.getTitle(),
                    "STATUS_CHANGED",
                    "Task '" + saved.getTitle() + "' changed status from " + oldStatus + " to " + saved.getStatus()
            );
        } else if (!oldTitle.equals(saved.getTitle())) {
            activityLogService.logActivity(
                    saved.getBoard().getId(),
                    id,
                    saved.getTitle(),
                    "TASK_UPDATED",
                    "Task was renamed from '" + oldTitle + "' to '" + saved.getTitle() + "'"
            );
        } else {
            activityLogService.logActivity(
                    saved.getBoard().getId(),
                    id,
                    saved.getTitle(),
                    "TASK_UPDATED",
                    "Task '" + saved.getTitle() + "' was updated"
            );
        }

        return saved;
    }

    /**
     * Fast status transition for quick board Kanban updates.
     */
    @Transactional
    public Task updateTaskStatus(Long id, Task.TaskStatus newStatus) {
        Task existingTask = getTaskById(id);
        Task.TaskStatus oldStatus = existingTask.getStatus();
        if (oldStatus == newStatus) {
            return existingTask;
        }

        existingTask.setStatus(newStatus);
        Task saved = taskRepository.save(existingTask);

        activityLogService.logActivity(
                saved.getBoard().getId(),
                id,
                saved.getTitle(),
                "STATUS_CHANGED",
                "Task '" + saved.getTitle() + "' moved from " + oldStatus + " to " + newStatus
        );

        return saved;
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

        activityLogService.logActivity(
                task.getBoard().getId(),
                id,
                task.getTitle(),
                "TASK_DELETED",
                "Task '" + task.getTitle() + "' was deleted"
        );
    }

    /**
     * Search tasks by title keyword (case-insensitive), sorted newest first.
     *
     * @param boardId optional board ID filter
     * @param keyword the keyword to search for
     * @return list of matching tasks
     */
    @Transactional(readOnly = true)
    public List<Task> searchTasks(Long boardId, String keyword) {
        if (boardId != null) {
            log.debug("Searching tasks in board {} with keyword: {}", boardId, keyword);
            return taskRepository.findByBoardIdAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(boardId, keyword);
        }
        log.debug("Searching all tasks with keyword: {}", keyword);
        return taskRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
    }

    /**
     * Compute aggregated task statistics using fast indexed database COUNT queries.
     *
     * @param boardId optional board ID filter
     * @return TaskStatsDto containing counts
     */
    @Transactional(readOnly = true)
    public TaskStatsDto getTaskStats(Long boardId) {
        LocalDateTime now = LocalDateTime.now();
        if (boardId != null) {
            long pending = taskRepository.countByBoardIdAndStatus(boardId, Task.TaskStatus.PENDING);
            long inProgress = taskRepository.countByBoardIdAndStatus(boardId, Task.TaskStatus.IN_PROGRESS);
            long completed = taskRepository.countByBoardIdAndStatus(boardId, Task.TaskStatus.COMPLETED);
            long total = taskRepository.countByBoardId(boardId);
            long overdue = taskRepository.countByBoardIdAndDueDateBeforeAndStatusNot(boardId, now, Task.TaskStatus.COMPLETED);

            return TaskStatsDto.builder()
                    .boardId(boardId)
                    .pending(pending)
                    .inProgress(inProgress)
                    .completed(completed)
                    .overdue(overdue)
                    .total(total)
                    .build();
        } else {
            long pending = taskRepository.countByStatus(Task.TaskStatus.PENDING);
            long inProgress = taskRepository.countByStatus(Task.TaskStatus.IN_PROGRESS);
            long completed = taskRepository.countByStatus(Task.TaskStatus.COMPLETED);
            long total = taskRepository.count();
            long overdue = taskRepository.countByDueDateBeforeAndStatusNot(now, Task.TaskStatus.COMPLETED);

            return TaskStatsDto.builder()
                    .boardId(null)
                    .pending(pending)
                    .inProgress(inProgress)
                    .completed(completed)
                    .overdue(overdue)
                    .total(total)
                    .build();
        }
    }
}

