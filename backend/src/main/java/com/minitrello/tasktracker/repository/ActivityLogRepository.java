package com.minitrello.tasktracker.repository;

import com.minitrello.tasktracker.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ActivityLog Repository - provides query methods for audit logs.
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    /**
     * Find all activity logs for a specific board, ordered by most recent first.
     *
     * @param boardId the board ID
     * @return list of activity logs
     */
    List<ActivityLog> findByBoardIdOrderByTimestampDesc(Long boardId);

    /**
     * Find all activity logs ordered by most recent first.
     *
     * @return list of all activity logs
     */
    List<ActivityLog> findAllByOrderByTimestampDesc();
}
