import api from '../../lib/axios.js'

export async function listLists(boardId) {
  const { data } = await api.get('/api/lists', { params: { boardId } })
  return data.data
}

export async function createList(payload) {
  const { data } = await api.post('/api/lists', payload)
  return data.data
}

export async function updateList(id, payload) {
  const { data } = await api.patch(`/api/lists/${id}`, payload)
  return data.data
}

export async function deleteList(id) {
  await api.delete(`/api/lists/${id}`)
}

