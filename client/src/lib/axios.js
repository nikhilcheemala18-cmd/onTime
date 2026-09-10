import axios from 'axios'
import { clearStoredSession, getStoredToken } from './authStorage.js'

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredSession()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:expired'))
      }
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong'
    const normalizedError = new Error(message)
    normalizedError.status = error.response?.status
    normalizedError.data = error.response?.data

    return Promise.reject(normalizedError)
  },
)

export default api
