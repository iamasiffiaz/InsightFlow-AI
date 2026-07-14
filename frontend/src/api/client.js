import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insightflow_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail
    if (status === 401) {
      localStorage.removeItem('insightflow_token')
      localStorage.removeItem('insightflow_user')
      if (!window.location.pathname.startsWith('/login')) {
        toast.error(typeof detail === 'string' ? detail : 'Session expired. Please log in.')
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  mockLogin: () => api.post('/auth/mock-login'),
  me: () => api.get('/auth/me'),
}

export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
}

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
  suggest: (projectId) => api.post(`/tasks/suggest/${projectId}`),
}

export const insightsApi = {
  list: (params) => api.get('/insights', { params }),
  generate: (data) => api.post('/insights/generate', data),
  remove: (id) => api.delete(`/insights/${id}`),
}

export const reportsApi = {
  list: (params) => api.get('/reports', { params }),
  generate: (data) => api.post('/reports/generate', data),
  remove: (id) => api.delete(`/reports/${id}`),
}

export const recommendationsApi = {
  list: () => api.get('/recommendations'),
  generate: () => api.post('/recommendations/generate', { refresh: true }),
}

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}
