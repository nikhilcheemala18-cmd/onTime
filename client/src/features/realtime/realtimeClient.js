import { io } from 'socket.io-client'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000'

let socket
let joinedWorkspaceId

export function connectRealtime(token, handlers = {}) {
  if (!token) return null

  if (socket) {
    socket.disconnect()
  }

  socket = io(API_URL, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => handlers.onStatus?.('connected'))
  socket.on('disconnect', () => handlers.onStatus?.('disconnected'))
  socket.on('connect_error', (error) => handlers.onError?.(error))

  return socket
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect()
    socket = null
    joinedWorkspaceId = null
  }
}

export function getRealtimeSocket() {
  return socket
}

export function joinWorkspaceRoom(workspaceId) {
  if (!socket || !workspaceId || joinedWorkspaceId === workspaceId) return

  if (joinedWorkspaceId) {
    socket.emit('workspace.leave', { workspaceId: joinedWorkspaceId })
  }

  socket.emit('workspace.join', { workspaceId }, (error) => {
    if (!error) joinedWorkspaceId = workspaceId
  })
}

export function leaveWorkspaceRoom(workspaceId) {
  if (!socket || !workspaceId) return
  socket.emit('workspace.leave', { workspaceId })
  if (joinedWorkspaceId === workspaceId) joinedWorkspaceId = null
}
