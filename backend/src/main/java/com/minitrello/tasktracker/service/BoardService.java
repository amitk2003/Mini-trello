package com.minitrello.tasktracker.service;

import com.minitrello.tasktracker.entity.Board;
import com.minitrello.tasktracker.repository.BoardRepository;
import com.minitrello.tasktracker.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * BoardService - Business logic layer for Board operations.
 */
@Service
public class BoardService {

    private static final Logger log = LoggerFactory.getLogger(BoardService.class);

    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;

    public BoardService(BoardRepository boardRepository, TaskRepository taskRepository, ActivityLogService activityLogService) {
        this.boardRepository = boardRepository;
        this.taskRepository = taskRepository;
        this.activityLogService = activityLogService;
    }

    /**
     * Retrieve all boards.
     */
    @Transactional(readOnly = true)
    public List<Board> getAllBoards() {
        log.debug("Fetching all boards");
        return boardRepository.findAllByOrderByCreatedAtAsc();
    }

    /**
     * Retrieve a single board by ID.
     */
    @Transactional(readOnly = true)
    public Board getBoardById(Long id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found with id: " + id));
    }

    /**
     * Create a new board.
     */
    @Transactional
    public Board createBoard(Board board) {
        log.info("Creating board: {}", board.getName());
        board.setId(null);
        Board saved = boardRepository.save(board);
        activityLogService.logActivity(saved.getId(), null, null, "BOARD_CREATED", "Board '" + saved.getName() + "' was created");
        return saved;
    }

    /**
     * Update an existing board.
     */
    @Transactional
    public Board updateBoard(Long id, Board boardDetails) {
        Board existing = getBoardById(id);
        String oldName = existing.getName();
        
        existing.setName(boardDetails.getName());
        existing.setDescription(boardDetails.getDescription());
        Board saved = boardRepository.save(existing);
        
        activityLogService.logActivity(
            saved.getId(), 
            null, 
            null, 
            "BOARD_UPDATED", 
            "Board '" + oldName + "' was renamed to '" + saved.getName() + "'"
        );
        return saved;
    }

    /**
     * Delete a board and all its tasks.
     */
    @Transactional
    public void deleteBoard(Long id) {
        Board board = getBoardById(id);
        
        // Delete all associated tasks first to prevent DB constraint issues
        taskRepository.deleteByBoardId(id);
        boardRepository.delete(board);
        
        log.info("Deleted board with id: {} and all its tasks", id);
        activityLogService.logActivity(
            id, 
            null, 
            null, 
            "BOARD_DELETED", 
            "Board '" + board.getName() + "' and all of its tasks were deleted"
        );
    }
}
