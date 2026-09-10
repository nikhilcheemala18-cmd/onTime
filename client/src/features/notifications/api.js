import api from '../../lib/axios.js'

export async function listNotifications({ page = 1, limit = 20, unread } = {}) {
  const { data } = await api.get('/api/notifications', {
    params: { page, limit, unread },
  })
  return data.data
}

export async function getUnreadCount() {
  const { data } = await api.get('/api/notifications/unread-count')
  return data.data
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/api/notifications/${id}/read`)
  return data.data
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/api/notifications/read-all')
  return data.data
}
