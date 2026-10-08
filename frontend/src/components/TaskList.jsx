import { useState, useEffect, useCallback } from 'react';
import { getAllTasks, deleteTask, getAllBoards, getTaskStats, updateTaskStatus } from '../api/taskApi';
import TaskForm from './TaskForm';
import BoardModal from './BoardModal';
import ActivityLogDrawer from './ActivityLogDrawer';
import './TaskList.css';

const FILTERS = [
  { label: 'All', value: null },
  { label: '⏳ Pending', value: 'PENDING' },
  { label: '🔵 In Progress', value: 'IN_PROGRESS' },
  { label: '✅ Completed', value: 'COMPLETED' },
];

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const PRIORITY_LABELS = {
  LOW: '🟢 Low',
  MEDIUM: '🟡 Medium',
  HIGH: '🟠 High',
  URGENT: '🔴 Urgent',
};

function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'COMPLETED') return false;
  return new Date(dueDate) < new Date();
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line wide" style={{ height: '16px', marginBottom: '14px' }} />
      <div className="skeleton-line medium" />
      <div className="skeleton-line short" style={{ marginBottom: '20px' }} />
      <div className="skeleton-line medium" style={{ height: '10px' }} />
    </div>
  );
}

export default function TaskList({ onStatsChange }) {
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null); // null means All Boards
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & Drawers state
  const [showForm, setShowForm] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // ─── Fetch Boards ───────────────────────────────────────────
  const fetchBoards = useCallback(async () => {
    try {
      const res = await getAllBoards();
      setBoards(res.data);
    } catch {
      console.warn('Could not fetch boards list');
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // ─── Fetch Tasks & Direct Stats ─────────────────────────────
  const fetchTasksAndStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Corrected call: boardId is first param, status is second!
      const [tasksRes, statsRes] = await Promise.all([
        getAllTasks(activeBoardId, activeFilter),
        getTaskStats(activeBoardId),
      ]);

      setTasks(tasksRes.data);
      if (statsRes.data && onStatsChange) {
        onStatsChange({
          pending: statsRes.data.pending,
          inProgress: statsRes.data.inProgress,
          completed: statsRes.data.completed,
          overdue: statsRes.data.overdue,
          total: statsRes.data.total,
        });
      }
    } catch {
      setError('Cannot connect to backend. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, [activeBoardId, activeFilter, onStatsChange]);

  useEffect(() => {
    fetchTasksAndStats();
  }, [fetchTasksAndStats]);

  // ─── Filtered Tasks (Client Search) ──────────────────────────
  const displayedTasks = tasks.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.tags && Array.from(t.tags).some((tag) => tag.toLowerCase().includes(q)))
    );
  });

  // ─── Quick Status Advance ────────────────────────────────────
  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic local update for instant snappy UI
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await updateTaskStatus(taskId, newStatus);
      fetchTasksAndStats();
    } catch {
      fetchTasksAndStats();
    }
  };

  // ─── Delete Task ─────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteTask(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchTasksAndStats();
    } catch {
      setError('Failed to delete task. Please try again.');
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const currentBoardObj = boards.find((b) => b.id === activeBoardId);

  return (
    <>
      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button className="close-btn" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* ── Board Navigation Bar ── */}
      <div className="board-selector-bar">
        <button
          className={`board-chip ${activeBoardId === null ? 'active' : ''}`}
          onClick={() => setActiveBoardId(null)}
        >
          🌐 All Boards
        </button>
        {boards.map((b) => (
          <button
            key={b.id}
            className={`board-chip ${activeBoardId === b.id ? 'active' : ''}`}
            onClick={() => setActiveBoardId(b.id)}
            title={b.description || b.name}
          >
            {b.name}
          </button>
        ))}
        <button
          className="btn-new-board"
          onClick={() => setShowBoardModal(true)}
          title="Create a new board"
        >
          + New Board
        </button>

        <button
          className="btn-activity-toggle"
          onClick={() => setShowActivityDrawer(true)}
          title="View audit trail"
        >
          📜 Activity Log
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-tasks"
            type="text"
            className="search-input"
            placeholder="Search by title, description, or tags…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search tasks"
          />
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs" role="group" aria-label="Filter tasks by status">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              className={`filter-tab ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter(f.value);
                setSearchTerm('');
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          id="add-task-btn"
          className="btn-add-task"
          onClick={() => { setEditingTask(null); setShowForm(true); }}
        >
          + New Task
        </button>
      </div>

      {/* ── Tasks Board ── */}
      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="tasks-board">
          <div className="empty-state">
            <div className="empty-icon">
              {searchTerm ? '🔍' : activeFilter ? '📭' : '🗂️'}
            </div>
            <h3>
              {searchTerm
                ? 'No tasks match your search'
                : activeFilter
                ? `No ${STATUS_LABELS[activeFilter]} tasks`
                : 'No tasks here yet!'}
            </h3>
            <p>
              {searchTerm
                ? 'Try a different keyword or clear your filter.'
                : 'Create your first task on this board to get started.'}
            </p>
            {!searchTerm && (
              <button
                className="btn-add-task"
                onClick={() => { setEditingTask(null); setShowForm(true); }}
              >
                + Create First Task
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="tasks-board">
          {displayedTasks.map((task, idx) => (
            <div
              key={task.id}
              className={`task-card status-${task.status}`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {/* Card Header */}
              <div className="card-header">
                <h3 className="card-title">{task.title}</h3>
                <span className={`status-badge badge-${task.status}`}>
                  {task.status === 'PENDING' && '⏳'}
                  {task.status === 'IN_PROGRESS' && '🔵'}
                  {task.status === 'COMPLETED' && '✅'}
                  {' '}{STATUS_LABELS[task.status]}
                </span>
              </div>

              {/* Board Badge & Priority */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', margin: '0.4rem 0 0.6rem', flexWrap: 'wrap' }}>
                {task.priority && (
                  <span className={`priority-badge priority-${task.priority}`}>
                    {PRIORITY_LABELS[task.priority] || task.priority}
                  </span>
                )}
                {task.board && activeBoardId === null && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    📁 {task.board.name}
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <p className="card-description">{task.description}</p>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="card-tags">
                  {Array.from(task.tags).map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="card-meta">
                {task.createdAt && (
                  <span className="meta-item">
                    📅 {formatDate(task.createdAt)}
                  </span>
                )}
                {task.dueDate && (
                  <span
                    className="meta-item"
                    style={{ color: isOverdue(task.dueDate, task.status) ? '#f87171' : '' }}
                  >
                    {isOverdue(task.dueDate, task.status) ? '🔴 Overdue' : '⏰ Due'} {formatDate(task.dueDate)}
                  </span>
                )}
              </div>

              {/* Quick Status Advance */}
              <div className="quick-advance-group">
                {task.status === 'PENDING' && (
                  <button
                    className="btn-quick-status"
                    onClick={() => handleQuickStatusChange(task.id, 'IN_PROGRESS')}
                    title="Start working on this task"
                  >
                    Start ➡️
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      className="btn-quick-status"
                      onClick={() => handleQuickStatusChange(task.id, 'PENDING')}
                      title="Move back to pending"
                    >
                      ⬅️ Pending
                    </button>
                    <button
                      className="btn-quick-status btn-done"
                      onClick={() => handleQuickStatusChange(task.id, 'COMPLETED')}
                      title="Mark as completed"
                    >
                      Done ✅
                    </button>
                  </>
                )}
                {task.status === 'COMPLETED' && (
                  <button
                    className="btn-quick-status"
                    onClick={() => handleQuickStatusChange(task.id, 'IN_PROGRESS')}
                    title="Reopen task"
                  >
                    🔄 Reopen
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="card-actions">
                <button
                  className="btn-icon btn-edit"
                  id={`edit-task-${task.id}`}
                  onClick={() => { setEditingTask(task); setShowForm(true); }}
                  aria-label={`Edit task: ${task.title}`}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-icon btn-delete"
                  id={`delete-task-${task.id}`}
                  onClick={() => setDeleteConfirm(task)}
                  aria-label={`Delete task: ${task.title}`}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Task Form Modal ── */}
      {showForm && (
        <TaskForm
          task={editingTask}
          defaultBoardId={activeBoardId}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          onSave={() => fetchTasksAndStats()}
        />
      )}

      {/* ── Board Modal ── */}
      {showBoardModal && (
        <BoardModal
          onClose={() => setShowBoardModal(false)}
          onCreated={(newBoard) => {
            fetchBoards();
            setActiveBoardId(newBoard.id);
          }}
        />
      )}

      {/* ── Activity Log Drawer ── */}
      <ActivityLogDrawer
        boardId={activeBoardId}
        boardName={currentBoardObj?.name}
        isOpen={showActivityDrawer}
        onClose={() => setShowActivityDrawer(false)}
      />

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="delete-confirm-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setDeleteConfirm(null);
        }}>
          <div className="delete-confirm-card">
            <div className="delete-confirm-icon">🗑️</div>
            <h3>Delete Task?</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                "{deleteConfirm.title}"
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="delete-confirm-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                id="confirm-delete-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
