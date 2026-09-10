import api from '../../lib/axios.js'

export async function listWorkspaces() {
  const { data } = await api.get('/api/workspaces')
  return data.data
}

export async function getWorkspace(id) {
  const { data } = await api.get(`/api/workspaces/${id}`)
  return data.data
}

export async function createWorkspace(payload) {
  const { data } = await api.post('/api/workspaces', payload)
  return data.data
}

export async function updateWorkspace(id, payload) {
  const { data } = await api.patch(`/api/workspaces/${id}`, payload)
  return data.data
}

export async function deleteWorkspace(id) {
  await api.delete(`/api/workspaces/${id}`)
}

