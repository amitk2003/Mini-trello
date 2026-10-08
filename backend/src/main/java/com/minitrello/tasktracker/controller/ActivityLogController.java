package com.minitrello.tasktracker.controller;

import com.minitrello.tasktracker.entity.ActivityLog;
import com.minitrello.tasktracker.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ActivityLogController - REST API Controller for retrieving audit trail logs.
 * Base URL: /api/activity-logs
 */
@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"})
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    /**
     * GET /api/activity-logs - Retrieve activity logs, optionally filtered by boardId.
     *
     * @param boardId optional board filter
     * @return list of activity logs
     */
    @GetMapping
    public ResponseEntity<List<ActivityLog>> getActivityLogs(
            @RequestParam(required = false) Long boardId) {
        List<ActivityLog> logs = activityLogService.getActivityLogs(boardId);
        return ResponseEntity.ok(logs);
    }
}
