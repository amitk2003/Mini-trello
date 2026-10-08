import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Axios Interceptors for Logging ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.message || error.message || 'Unknown error';
    console.error('[API Error]', msg);
    return Promise.reject(error);
  }
);

// ─── Task API Methods ──────────────────────────────────────────────────────────

/** Fetch tasks, optionally filtered by board and status */
export const getAllTasks = (boardId = null, status = null) => {
  const params = {};
  if (boardId) params.boardId = boardId;
  if (status) params.status = status;
  return api.get('/tasks', { params });
};

/** Fetch a single task by ID */
export const getTaskById = (id) => api.get(`/tasks/${id}`);

/** Create a new task */
export const createTask = (taskData) => api.post('/tasks', taskData);

/** Update an existing task by ID */
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);

/** Delete a task by ID */
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

/** Fetch task stats (pending, in-progress, completed, overdue, total) directly from backend */
export const getTaskStats = (boardId = null) => {
  const params = {};
  if (boardId) params.boardId = boardId;
  return api.get('/tasks/stats', { params });
};

/** Quick update task status */
export const updateTaskStatus = (id, status) => {
  return api.patch(`/tasks/${id}/status`, null, { params: { status } });
};

/** Search tasks by keyword, optionally filtered by board */
export const searchTasks = (keyword, boardId = null) => {
  const params = { keyword };
  if (boardId) params.boardId = boardId;
  return api.get('/tasks/search', { params });
};

// ─── Board API Methods ──────────────────────────────────────────────────────────

/** Fetch all boards */
export const getAllBoards = () => api.get('/boards');

/** Fetch a single board by ID */
export const getBoardById = (id) => api.get(`/boards/${id}`);

/** Create a new board */
export const createBoard = (boardData) => api.post('/boards', boardData);

/** Update an existing board by ID */
export const updateBoard = (id, boardData) => api.put(`/boards/${id}`, boardData);

/** Delete a board by ID (will cascade delete its tasks) */
export const deleteBoard = (id) => api.delete(`/boards/${id}`);

// ─── Activity Log API Methods ──────────────────────────────────────────────────

/** Fetch activity logs, optionally filtered by board */
export const getActivityLogs = (boardId = null) => {
  const params = {};
  if (boardId) params.boardId = boardId;
  return api.get('/activity-logs', { params });
};

export default api;
