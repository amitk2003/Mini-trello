package com.minitrello.tasktracker.service;

import com.minitrello.tasktracker.entity.ActivityLog;
import com.minitrello.tasktracker.repository.ActivityLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ActivityLogService - Handles operations for audit logs.
 */
@Service
public class ActivityLogService {

    private static final Logger log = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    /**
     * Create and persist a new activity log.
     */
    @Transactional
    public void logActivity(Long boardId, Long taskId, String taskTitle, String action, String details) {
        log.debug("Logging activity: Board={} Task='{}' Action={} Details='{}'", boardId, taskTitle, action, details);
        
        ActivityLog logEntry = new ActivityLog();
        logEntry.setBoardId(boardId);
        logEntry.setTaskId(taskId);
        logEntry.setTaskTitle(taskTitle);
        logEntry.setAction(action);
        logEntry.setDetails(details);
        logEntry.setTimestamp(LocalDateTime.now());
        
        activityLogRepository.save(logEntry);
    }

    /**
     * Retrieve activity logs, optionally filtered by board.
     */
    @Transactional(readOnly = true)
    public List<ActivityLog> getActivityLogs(Long boardId) {
        if (boardId != null) {
            return activityLogRepository.findByBoardIdOrderByTimestampDesc(boardId);
        }
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
