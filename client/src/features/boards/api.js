import api from '../../lib/axios.js'

export async function listBoards(workspaceId) {
  const { data } = await api.get('/api/boards', { params: { workspaceId } })
  return data.data
}

export async function getBoard(id) {
  const { data } = await api.get(`/api/boards/${id}`)
  return data.data
}

export async function createBoard(payload) {
  const { data } = await api.post('/api/boards', payload)
  return data.data
}

export async function updateBoard(id, payload) {
  const { data } = await api.patch(`/api/boards/${id}`, payload)
  return data.data
}

export async function deleteBoard(id) {
  await api.delete(`/api/boards/${id}`)
}

