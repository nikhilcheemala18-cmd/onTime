export const realtimeEvents = [
  'workspace.created',
  'workspace.updated',
  'board.created',
  'board.updated',
  'board.deleted',
  'list.created',
  'list.updated',
  'list.deleted',
  'card.created',
  'card.updated',
  'card.deleted',
  'comment.created',
  'comment.updated',
  'comment.deleted',
  'attachment.uploaded',
  'attachment.deleted',
  'member.added',
  'member.role_updated',
  'member.removed',
  'notification.created',
]

export function getWorkspaceRoom(workspaceId) {
  return `workspace:${workspaceId}`
}

export function getUserRoom(userId) {
  return `user:${userId}`
}

export function buildRealtimePayload(type, workspaceId, data = {}) {
  return {
    type,
    workspaceId: workspaceId.toString(),
    data,
  }
}
