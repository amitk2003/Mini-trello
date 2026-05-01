import { useState, useCallback } from 'react';
import TaskList from './components/TaskList';
import './index.css';
import './App.css';

/**
 * App – Root component.
 * Holds global task stats displayed in the sticky header.
 */
export default function App() {
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });

  const handleStatsChange = useCallback((newStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="app">
      {/* ── Sticky Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">📋</div>
          <div>
            <div className="header-title">MiniTrello</div>
            <div className="header-subtitle">Task Tracker</div>
          </div>
        </div>

        <div className="header-stats" aria-label="Task statistics">
          <div className="stat-pill">
            <span className="dot dot-pending" />
            {stats.pending} Pending
          </div>
          <div className="stat-pill">
            <span className="dot dot-progress" />
            {stats.inProgress} In Progress
          </div>
          <div className="stat-pill">
            <span className="dot dot-completed" />
            {stats.completed} Completed
          </div>
          <div className="stat-pill" style={{ fontWeight: 700 }}>
            📊 {stats.total} Total
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* Page Hero */}
        <div className="page-hero">
          <h1>Manage Your Tasks</h1>
          <p>
            Create, organize, and track your work in one place.
            Stay on top of everything — beautifully.
          </p>
        </div>

        {/* Task Board */}
        <TaskList onStatsChange={handleStatsChange} />
      </main>
    </div>
  );
}
