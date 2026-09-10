import api from '../../lib/axios.js'

export async function listActivities({ workspaceId, page = 1, limit = 20 }) {
  const { data } = await api.get('/api/activities', {
    params: { workspaceId, page, limit },
  })
  return data.data
}

