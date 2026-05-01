import { useState, useEffect, useCallback } from 'react';
import { getAllTasks, deleteTask } from '../api/taskApi';
import TaskForm from './TaskForm';
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

/**
 * Format an ISO date string into a human-readable short date.
 */
function formatDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Check if a due date is overdue (past current date and not completed).
 */
function isOverdue(dueDate, status) {
  if (!dueDate || status === 'COMPLETED') return false;
  return new Date(dueDate) < new Date();
}

// ─── Skeleton Loading Card ────────────────────────────────────
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

/**
 * TaskList – the main board displaying all tasks with filtering,
 * search, and CRUD controls.
 *
 * Props:
 *  - stats (object): { pending, inProgress, completed } counts
 *  - onStatsChange (fn): callback to update parent stats
 */
export default function TaskList({ onStatsChange }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // task to delete
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // ─── Fetch tasks ────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllTasks(activeFilter);
      setTasks(res.data);

      // Compute stats for header
      const all = activeFilter ? await getAllTasks(null) : res;
      const allTasks = all.data;
      onStatsChange({
        pending: allTasks.filter((t) => t.status === 'PENDING').length,
        inProgress: allTasks.filter((t) => t.status === 'IN_PROGRESS').length,
        completed: allTasks.filter((t) => t.status === 'COMPLETED').length,
        total: allTasks.length,
      });
    } catch {
      setError('Cannot connect to backend. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, onStatsChange]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ─── Client-side search filter ───────────────────────────────
  const displayedTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Handle task save (create or update) ────────────────────
  const handleSave = () => {
    fetchTasks();
  };

  // ─── Open edit modal ─────────────────────────────────────────
  const openEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // ─── Close modal ─────────────────────────────────────────────
  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // ─── Confirm & execute delete ────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteTask(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchTasks();
    } catch {
      setError('Failed to delete task. Please try again.');
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button className="close-btn" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="search-tasks"
            type="text"
            className="search-input"
            placeholder="Search tasks…"
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
                : 'No tasks yet!'}
            </h3>
            <p>
              {searchTerm
                ? 'Try a different search term.'
                : 'Create your first task to get started.'}
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
              style={{ animationDelay: `${idx * 0.05}s` }}
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

              {/* Description */}
              {task.description && (
                <p className="card-description">{task.description}</p>
              )}

              {/* Meta */}
              <div className="card-meta">
                {task.createdAt && (
                  <span className="meta-item">
                    📅 Created {formatDate(task.createdAt)}
                  </span>
                )}
                {task.dueDate && (
                  <span
                    className="meta-item"
                    style={{ color: isOverdue(task.dueDate, task.status) ? '#f87171' : '' }}
                  >
                    {isOverdue(task.dueDate, task.status) ? '🔴' : '⏰'} Due {formatDate(task.dueDate)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="card-actions">
                <button
                  className="btn-icon btn-edit"
                  id={`edit-task-${task.id}`}
                  onClick={() => openEdit(task)}
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
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

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
