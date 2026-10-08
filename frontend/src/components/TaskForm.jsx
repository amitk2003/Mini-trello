import { useState, useEffect } from 'react';
import { createTask, updateTask, getAllBoards } from '../api/taskApi';
import './TaskForm.css';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '⏳ Pending' },
  { value: 'IN_PROGRESS', label: '🔵 In Progress' },
  { value: 'COMPLETED', label: '✅ Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: '🟢 Low Priority' },
  { value: 'MEDIUM', label: '🟡 Medium Priority' },
  { value: 'HIGH', label: '🟠 High Priority' },
  { value: 'URGENT', label: '🔴 Urgent' },
];

/**
 * TaskForm – modal dialog for creating or editing a task.
 *
 * Props:
 *  - task (object|null): if provided, pre-fills form for editing
 *  - defaultBoardId (number|null): preselected board if creating new task
 *  - onClose (fn): called when the modal is dismissed
 *  - onSave (fn): called after a successful save with the saved task
 */
export default function TaskForm({ task, defaultBoardId, onClose, onSave }) {
  const isEditing = Boolean(task?.id);

  const [boards, setBoards] = useState([]);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'PENDING',
    priority: task?.priority || 'MEDIUM',
    boardId: task?.board?.id || defaultBoardId || '',
    dueDate: task?.dueDate ? task.dueDate.substring(0, 16) : '',
    tags: task?.tags ? Array.from(task.tags).join(', ') : '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch available boards for selection
  useEffect(() => {
    getAllBoards()
      .then((res) => {
        setBoards(res.data);
        if (!formData.boardId && res.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            boardId: defaultBoardId || res.data[0].id,
          }));
        }
      })
      .catch((err) => console.error('Failed to load boards for task form', err));
  }, [defaultBoardId, formData.boardId]);

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Field change handler ─────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  // ─── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const parsedTags = formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        tags: parsedTags,
      };

      if (formData.boardId) {
        payload.board = { id: Number(formData.boardId) };
      }

      let response;
      if (isEditing) {
        response = await updateTask(task.id, payload);
      } else {
        response = await createTask(payload);
      }

      onSave(response.data);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.fieldErrors?.title ||
        err.response?.data?.message ||
        'Failed to save task. Make sure the backend is running.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <h2 id="task-form-title">
            {isEditing ? '✏️ Edit Task' : '✨ New Task'}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="error-banner" style={{ margin: '0 2rem', marginTop: '1rem' }}>
            ⚠️ {apiError}
            <button className="close-btn" onClick={() => setApiError('')}>✕</button>
          </div>
        )}

        {/* Form */}
        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {/* Board Selector */}
          {boards.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="boardId">
                Board
              </label>
              <select
                id="boardId"
                name="boardId"
                className="form-select"
                value={formData.boardId}
                onChange={handleChange}
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="e.g. Implement authentication filter"
              value={formData.title}
              onChange={handleChange}
              autoFocus
              maxLength={100}
            />
            {errors.title && (
              <span className="form-error">⚠ {errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Add task details..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {formData.description.length}/500
            </span>
            {errors.description && (
              <span className="form-error">⚠ {errors.description}</span>
            )}
          </div>

          {/* Status + Priority row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Tags row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="datetime-local"
                className="form-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
              <input
                id="tags"
                name="tags"
                type="text"
                className="form-input"
                placeholder="e.g. Backend, API, Docs"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-task-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Saving…
                </>
              ) : isEditing ? (
                '💾 Save Changes'
              ) : (
                '✨ Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
