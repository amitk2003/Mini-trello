import { useState } from 'react';
import { createBoard } from '../api/taskApi';

export default function BoardModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Board name is required');
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      setError('Board name must be between 2 and 100 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await createBoard({
        name: name.trim(),
        description: description.trim() || null,
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2>🗂️ Create New Board</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {error && (
          <div className="error-banner" style={{ margin: '1rem 2rem 0' }}>
            ⚠️ {error}
          </div>
        )}

        <form className="task-form" onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="board-name">
              Board Name <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              id="board-name"
              type="text"
              className="form-input"
              placeholder="e.g. 🚀 Q4 Product Launch"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              autoFocus
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="board-desc">
              Description (optional)
            </label>
            <textarea
              id="board-desc"
              className="form-textarea"
              placeholder="What is this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : '✨ Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
