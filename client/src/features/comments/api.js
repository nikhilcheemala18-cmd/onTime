import api from '../../lib/axios.js'

export async function listComments(cardId) {
  const { data } = await api.get('/api/comments', { params: { cardId } })
  return data.data
}

export async function createComment(payload) {
  const { data } = await api.post('/api/comments', payload)
  return data.data
}

export async function updateComment(id, payload) {
  const { data } = await api.patch(`/api/comments/${id}`, payload)
  return data.data
}

export async function deleteComment(id) {
  await api.delete(`/api/comments/${id}`)
}

