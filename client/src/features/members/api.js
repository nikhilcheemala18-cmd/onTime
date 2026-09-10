import api from '../../lib/axios.js'

export async function listMembers(workspaceId) {
  const { data } = await api.get(`/api/workspaces/${workspaceId}/members`)
  return data.data
}

export async function getMyMembership(workspaceId) {
  const { data } = await api.get(`/api/workspaces/${workspaceId}/members/me`)
  return data.data
}

export async function addMember(workspaceId, payload) {
  const { data } = await api.post(`/api/workspaces/${workspaceId}/members`, payload)
  return data.data
}

export async function updateMemberRole(workspaceId, memberId, payload) {
  const { data } = await api.patch(`/api/workspaces/${workspaceId}/members/${memberId}`, payload)
  return data.data
}

export async function removeMember(workspaceId, memberId) {
  await api.delete(`/api/workspaces/${workspaceId}/members/${memberId}`)
}

