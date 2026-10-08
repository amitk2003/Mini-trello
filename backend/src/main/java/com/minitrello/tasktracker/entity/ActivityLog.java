package com.minitrello.tasktracker.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * ActivityLog Entity - logs actions and events for audit trail.
 * Maps to the "activity_logs" table with performance indexes.
 */
@Entity
@Table(
    name = "activity_logs",
    indexes = {
        @Index(name = "idx_act_board_id", columnList = "board_id"),
        @Index(name = "idx_act_timestamp", columnList = "timestamp")
    }
)
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_id")
    private Long boardId;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "task_title", length = 100)
    private String taskTitle;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(length = 500)
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ActivityLog() {
    }

    public ActivityLog(Long id, Long boardId, Long taskId, String taskTitle, String action, String details, LocalDateTime timestamp) {
        this.id = id;
        this.boardId = boardId;
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.action = action;
        this.details = details;
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBoardId() {
        return boardId;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
