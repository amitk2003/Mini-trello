package com.minitrello.tasktracker.controller;

import com.minitrello.tasktracker.entity.Board;
import com.minitrello.tasktracker.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BoardController - REST API Controller for Board operations.
 * Base URL: /api/boards
 */
@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"})
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    /**
     * GET /api/boards - Retrieve all boards.
     */
    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }

    /**
     * GET /api/boards/{id} - Retrieve a board by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoardById(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardById(id));
    }

    /**
     * POST /api/boards - Create a new board.
     */
    @PostMapping
    public ResponseEntity<Board> createBoard(@Valid @RequestBody Board board) {
        Board created = boardService.createBoard(board);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/boards/{id} - Update a board.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(
            @PathVariable Long id, 
            @Valid @RequestBody Board boardDetails) {
        Board updated = boardService.updateBoard(id, boardDetails);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/boards/{id} - Delete a board and its associated tasks.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok(Map.of(
                "message", "Board and its tasks deleted successfully",
                "boardId", id.toString()
        ));
    }
}
