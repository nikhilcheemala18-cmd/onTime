import {
  buildRealtimePayload,
  getUserRoom,
  getWorkspaceRoom,
  realtimeEvents,
} from './events.js'

let io

export function setSocketServer(socketServer) {
  io = socketServer
}

export function getSocketServer() {
  return io
}

export function broadcastWorkspaceEvent({ type, workspaceId, data }) {
  if (!io || !realtimeEvents.includes(type)) {
    return
  }

  const payload = buildRealtimePayload(type, workspaceId, data)

  io.to(getWorkspaceRoom(workspaceId)).emit(type, payload)
}

export function broadcastUserEvent({ userId, type, workspaceId, data }) {
  if (!io || !realtimeEvents.includes(type)) {
    return
  }

  const payload = buildRealtimePayload(type, workspaceId, data)

  io.to(getUserRoom(userId)).emit(type, payload)
}

export function removeUserFromWorkspaceRoom(userId, workspaceId) {
  if (!io) {
    return
  }

  io.in(getUserRoom(userId)).socketsLeave(getWorkspaceRoom(workspaceId))
}
