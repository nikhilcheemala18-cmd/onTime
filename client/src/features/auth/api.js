import api from '../../lib/axios.js'

export async function login(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  return data.data
}

export async function register(payload) {
  const { data } = await api.post('/api/auth/register', payload)
  return data.data
}

