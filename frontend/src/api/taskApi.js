import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/tasks';

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

/** Fetch all tasks, optionally filtered by status */
export const getAllTasks = (status = null) => {
  const params = status ? { status } : {};
  return api.get('/', { params });
};

/** Fetch a single task by ID */
export const getTaskById = (id) => api.get(`/${id}`);

/** Create a new task */
export const createTask = (taskData) => api.post('/', taskData);

/** Update an existing task by ID */
export const updateTask = (id, taskData) => api.put(`/${id}`, taskData);

/** Delete a task by ID */
export const deleteTask = (id) => api.delete(`/${id}`);

/** Search tasks by keyword in title */
export const searchTasks = (keyword) => api.get('/search', { params: { keyword } });

export default api;
