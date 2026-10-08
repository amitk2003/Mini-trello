import { useState, useEffect, useCallback } from 'react';
import { getActivityLogs } from '../api/taskApi';

export default function ActivityLogDrawer({ boardId, boardName, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await getActivityLogs(boardId);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load activity logs', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen, boardId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  if (!isOpen) return null;

  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'TASK_CREATED':
        return { label: 'Created', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'STATUS_CHANGED':
        return { label: 'Status Change', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'TASK_UPDATED':
        return { label: 'Updated', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'TASK_MOVED':
        return { label: 'Moved', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'TASK_DELETED':
        return { label: 'Deleted', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'BOARD_CREATED':
        return { label: 'Board Created', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' };
      case 'BOARD_UPDATED':
        return { label: 'Board Updated', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' };
      case 'BOARD_DELETED':
        return { label: 'Board Deleted', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
      default:
        return { label: action, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        padding: 0,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Drawer Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📜 Audit Trail
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {boardName ? `Board: ${boardName}` : 'All Workspace Boards'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn-icon"
              style={{ fontSize: '0.9rem', padding: '0.4rem 0.6rem' }}
              onClick={fetchLogs}
              title="Refresh logs"
            >
              🔄
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close drawer">
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {loading && logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading audit logs…
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <p>No activity recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map((log) => {
                const badge = getActionBadge(log.action);
                return (
                  <div
                    key={log.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '0.9rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          color: badge.color,
                          background: badge.bg,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {log.details || log.taskTitle || 'Activity recorded'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
