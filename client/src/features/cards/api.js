import api from '../../lib/axios.js'

export async function listCards(listId) {
  const { data } = await api.get('/api/cards', { params: { listId } })
  return data.data
}

export async function getCard(id) {
  const { data } = await api.get(`/api/cards/${id}`)
  return data.data
}

export async function createCard(payload) {
  const { data } = await api.post('/api/cards', payload)
  return data.data
}

export async function updateCard(id, payload) {
  const { data } = await api.patch(`/api/cards/${id}`, payload)
  return data.data
}

export async function deleteCard(id) {
  await api.delete(`/api/cards/${id}`)
}

