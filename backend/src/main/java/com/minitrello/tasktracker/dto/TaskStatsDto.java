package com.minitrello.tasktracker.dto;

/**
 * TaskStatsDto - aggregated statistics for tasks, calculated efficiently at database layer.
 */
public class TaskStatsDto {
    private long pending;
    private long inProgress;
    private long completed;
    private long overdue;
    private long total;
    private Long boardId;

    public TaskStatsDto() {
    }

    public TaskStatsDto(long pending, long inProgress, long completed, long overdue, long total, Long boardId) {
        this.pending = pending;
        this.inProgress = inProgress;
        this.completed = completed;
        this.overdue = overdue;
        this.total = total;
        this.boardId = boardId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private long pending;
        private long inProgress;
        private long completed;
        private long overdue;
        private long total;
        private Long boardId;

        public Builder pending(long pending) {
            this.pending = pending;
            return this;
        }

        public Builder inProgress(long inProgress) {
            this.inProgress = inProgress;
            return this;
        }

        public Builder completed(long completed) {
            this.completed = completed;
            return this;
        }

        public Builder overdue(long overdue) {
            this.overdue = overdue;
            return this;
        }

        public Builder total(long total) {
            this.total = total;
            return this;
        }

        public Builder boardId(Long boardId) {
            this.boardId = boardId;
            return this;
        }

        public TaskStatsDto build() {
            return new TaskStatsDto(pending, inProgress, completed, overdue, total, boardId);
        }
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getInProgress() {
        return inProgress;
    }

    public void setInProgress(long inProgress) {
        this.inProgress = inProgress;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getOverdue() {
        return overdue;
    }

    public void setOverdue(long overdue) {
        this.overdue = overdue;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public Long getBoardId() {
        return boardId;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }
}
