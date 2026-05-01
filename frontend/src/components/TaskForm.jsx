import { useState } from 'react';
import { createTask, updateTask } from '../api/taskApi';
import './TaskForm.css';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '⏳ Pending' },
  { value: 'IN_PROGRESS', label: '🔵 In Progress' },
  { value: 'COMPLETED', label: '✅ Completed' },
];

/**
 * TaskForm – modal dialog for creating or editing a task.
 *
 * Props:
 *  - task (object|null): if provided, pre-fills form for editing
 *  - onClose (fn): called when the modal is dismissed
 *  - onSave (fn): called after a successful save with the saved task
 */
export default function TaskForm({ task, onClose, onSave }) {
  const isEditing = Boolean(task?.id);

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'PENDING',
    dueDate: task?.dueDate ? task.dueDate.substring(0, 16) : '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

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

  // ─── Close on overlay click ───────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
      onClick={handleOverlayClick}
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
              placeholder="e.g. Design the login page"
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

          {/* Status + Due Date row */}
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
