package com.minitrello.tasktracker.repository;

import com.minitrello.tasktracker.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Board Repository - provides JPA CRUD operations for Boards.
 */
@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    java.util.List<Board> findAllByOrderByCreatedAtAsc();
}
